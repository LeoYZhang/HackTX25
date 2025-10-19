import { Request, Response } from 'express';
import { extractOneProblem } from "../routes/parse";
import { User } from "../models/User";
import { getPrerequisites } from '../utils/prereq';
import { ChatSession, serializeChatSession } from '../utils/gemini';


export const uploadProblem = async (req: Request, res: Response): Promise<void> =>  {
    try {
        const { username, file, mimeType } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        const mindmap = JSON.parse(user.mindmap);
        // Convert file string to Buffer if needed
        let fileBuffer: Buffer;
        if (typeof file === 'string') {
            // If file is base64 encoded, decode it
            fileBuffer = Buffer.from(file, 'base64');
        } else if (file instanceof Buffer) {
            fileBuffer = file;
        } else {
            throw new Error('Invalid file format');
        }
        
        const problem = await extractOneProblem(fileBuffer, mimeType);
        type tuple = [string, boolean];
        let stack: tuple[] = [];
        let seenTopics: string[] = [];
        if (mindmap.topics) {
            if (typeof mindmap.topics === 'string') {
                seenTopics = JSON.parse(mindmap.topics);
            } else if (Array.isArray(mindmap.topics)) {
                seenTopics = mindmap.topics;
            }
        }
        let prereqs = await getPrerequisites(problem, seenTopics);
         for (const prereq of prereqs) {
             stack.push([prereq, false]);
         }
         
         const chatSession = new ChatSession({}, true, problem);
         let messages = [];
         if (stack.length > 0) {
            messages.push(await chatSession.getProblem());
            messages.push(await chatSession.sendMessage('Generate a question about this topic to test understanding and nudge the user towards solving the main problem: ' + stack[stack.length - 1][0]));
         }
        const state = {
            chatSession: serializeChatSession(chatSession),
            stack: stack,
            seenTopics: seenTopics
        };

        await User.findOneAndUpdate(
            { username },
            { state: JSON.stringify(state) }
        );
        
        res.status(200).json({
            success: true,
            messages: messages
        });
    } catch (error) {
        console.error('Error in uploadProblem:', error);
        res.status(500).json({
            success: false,
            messages: [],
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

export const sendTeacherCatMessage = async (req: Request, res: Response): Promise<void> =>  {
    try {
        const { username, message } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            res.status(404).json({
                success: false,
                messages: [],
                error: 'User not found'
            });
            return;
        }
        const chatSession = ChatSession.deserialize(user.state);
        let stack = JSON.parse(user.state).stack;
        let seenTopics = JSON.parse(user.state).seenTopics;
        let messages = [];
        let response = await chatSession.sendMessage('This is a user response, respond with either "Yes" or "No" to indicate if the user shows understanding of the topic and correctly answers your previous question:' + message);

        let mindmap = JSON.parse(user.mindmap);
        // Ensure mindmap has topics array - handle both old and new structures
        if (!mindmap.topics) {
            mindmap.topics = [];
        } else if (typeof mindmap.topics === 'string') {
            // If topics is stored as a JSON string, parse it
            mindmap.topics = JSON.parse(mindmap.topics);
        }
        if (response.startsWith("Yes")) {
            messages.push(response.substring(4).trim());
            type tuple = [string, boolean];
            let element: tuple = stack.pop();
            if (!element[1]) {
                mindmap.topics.push(element[0]);
            }
            // Ask about the next topic in the stack
            if (stack.length > 0) {
                response = await chatSession.sendMessage('Generate a question about this topic to test understanding and nudge the user towards solving the main problem: ' + stack[stack.length - 1][0]);
                messages.push(response);
            } else {
                response = "No more topics available. You're ready to solve the problem!";
                messages.push(response);
            }
        } else if (response.startsWith("No")) {
            messages.push(response.substring(3).trim());
            stack[stack.length - 1][1] = true;
            let subtopics = await getPrerequisites(stack[stack.length - 1][0], seenTopics);
            if (subtopics.length > 0) {
                seenTopics = [...seenTopics, ...subtopics]
                for (const subtopic of subtopics) {
                    stack.push([subtopic, false]);
                }
                response = await chatSession.sendMessage('Generate a question about this topic to test understanding and nudge the user towards solving the main problem: ' + stack[stack.length - 1][0]);
                messages.push(response);
            } else {
                response = await chatSession.sendMessage("Explain " + stack.pop()![0] + "\n");
                messages.push(response);
                if (stack.length > 0) {
                    response = await chatSession.sendMessage('Generate a question about this topic to test understanding and nudge the user towards solving the main problem: ' + stack[stack.length - 1][0]);
                    messages.push(response);
                } else {
                    response = "No more topics available. You're ready to solve the problem!";
                    messages.push(response);
                }
            }
        } else {
            console.log("BAD RESPONSE");
        }

        // Check if stack is empty and switch to student mode
        if (stack.length === 0) {
            // Switch to student mode like teacherCatDone does
            const currentState = JSON.parse(user.state);
            const problem = currentState.chatSession ? 
                JSON.parse(currentState.chatSession).problem : "";
            
            // Create new student chat session (isTeacherMode = false)
            
            const newStudentChatSession = new ChatSession({}, false, problem);
            
            const state = {
                chatSession: serializeChatSession(newStudentChatSession),
                stack: stack,
                seenTopics: seenTopics
            };

            await User.findOneAndUpdate(
                { username },
                { 
                    state: JSON.stringify(state),
                    mindmap: JSON.stringify(mindmap)
                }
            );

            res.status(200).json({
                success: true,
                messages: messages,
                done: true
            });
            return;
        }

        const state = {
            chatSession: serializeChatSession(chatSession),
            stack: stack,
            seenTopics: seenTopics
        };
        await User.findOneAndUpdate(
            { username },
            { 
                state: JSON.stringify(state),
                mindmap: JSON.stringify(mindmap)
            }
        );

        res.status(200).json({
            success: true,
            messages: messages,
            done: false
        });
    } catch (error) {
        console.error('Error in sendTeacherCatMessage:', error);
        res.status(500).json({
            success: false,
            messages: [],
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Boolean for done or not, handled accordingly
export const teacherCatDone = async (req: Request, res: Response): Promise<void> =>  {
    try {
        const { username, isDone } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        if (isDone) {
            // Replace with new student chat session
            const currentState = JSON.parse(user.state);
            const problem = currentState.chatSession ? 
                JSON.parse(currentState.chatSession).problem : "";
            
            // Create new student chat session (isTeacherMode = false)
            const newStudentChatSession = new ChatSession({}, false, problem);
            
            const state = {
                chatSession: serializeChatSession(newStudentChatSession),
                stack: currentState.stack,
                seenTopics: currentState.seenTopics
            };

            await User.findOneAndUpdate(
                { username },
                { state: JSON.stringify(state) }
            );

            res.status(200).json({
                success: true,
                message: "Switched to student mode. Please provide your solution to the problem."
            });
        } else {
            // Get next question like sendTeacherCatMessage
            const chatSession = ChatSession.deserialize(user.state);
            let stack = JSON.parse(user.state).stack;
            let seenTopics = JSON.parse(user.state).seenTopics;
            
            let response: string;
            if (stack.length > 0) {
                response = await chatSession.sendMessage('Generate a question about this topic to test understanding and nudge the user towards solving the main problem: ' + stack[stack.length - 1][0]);
            } else {
                response = "No more questions available. You're ready to solve the problem!";
            }

            const state = {
                chatSession: serializeChatSession(chatSession),
                stack: stack,
                seenTopics: seenTopics
            };

            await User.findOneAndUpdate(
                { username },
                { state: JSON.stringify(state) }
            );

            res.status(200).json({
                success: true,
                message: response
            });
        }
    } catch (error) {
        console.error('Error in teacherCatDone:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing teacher done request',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

export const sendStudentCatMessage = async (req: Request, res: Response): Promise<void> =>  {
    try {
        const { username, message } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            res.status(404).json({
                success: false,
                messages: [],
                error: 'User not found'
            });
            return;
        }

        const chatSession = ChatSession.deserialize(user.state);
        let response;
        if (chatSession.getHistory().length > 1) {
            response = await chatSession.sendMessage('This is a user response to your previous question. If you believe the user fully understands everything necessary, return only the text "Done" and nothing else. If not, either ask a follow up question to their response or ask a question about their initial solution: ' + message);
        } else {
            response = await chatSession.sendMessage('This is the user\'s initial solution to the problem, ask questions to pick at the user\'s solution and responses to ensure their understanding is solid. If you believe the user fully understands everything necessary, return only the text "Done" and nothing else:' + message);
        }
        
        // Check if the student has completed their understanding
        if (response === "Done") {
            // Student has completed their understanding
            const state = {
                chatSession: serializeChatSession(chatSession),
                stack: JSON.parse(user.state).stack,
                seenTopics: JSON.parse(user.state).seenTopics
            };

            await User.findOneAndUpdate(
                { username },
                { state: JSON.stringify(state) }
            );

            res.status(200).json({
                success: true,
                messages: ["Congratulations! You have successfully demonstrated your understanding of the problem and its solution."],
                done: true
            });
            return;
        }

        // Continue the conversation with the student
        const state = {
            chatSession: serializeChatSession(chatSession),
            stack: JSON.parse(user.state).stack,
            seenTopics: JSON.parse(user.state).seenTopics
        };

        await User.findOneAndUpdate(
            { username },
            { state: JSON.stringify(state) }
        );
        
        res.status(200).json({
            success: true,
            messages: [response],
            done: false
        });
    } catch (error) {
        console.error('Error in sendStudentCatMessage:', error);
        res.status(500).json({
            success: false,
            messages: [],
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}