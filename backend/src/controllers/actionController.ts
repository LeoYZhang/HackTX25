import { Request, Response } from 'express';
import { extractOneProblem } from "../routes/parse";
import { User } from "../models/User";
import { getPrerequisites } from '../utils/prereq';
import { ChatSession, serializeChatSession } from '../utils/gemini';

export const uploadProblem = async (req: Request, res: Response): Promise<void> =>  {
    console.log(req.body);
    try {
        // const { username, file, mimeType } = req.body;
        // const user = await User.findOne({ username });
        // if (!user) {
        //     res.status(404).json({
        //         success: false,
        //         message: 'User not found'
        //     });
        //     return;
        // }
        // const mindmap = JSON.parse(user.mindmap);
        // const problem = await extractOneProblem(file, mimeType);
        // type tuple = [string, boolean];
        // let stack: tuple[] = [];
        // let seenTopics: string[] = JSON.parse(mindmap.topics);
        // let prereqs = await getPrerequisites(problem, seenTopics);
        //  for (const prereq of prereqs) {
        //      stack.push([prereq, false]);
        //  }
         
        //  const chatSession = new ChatSession({}, true, problem);
        //  let msg = "";
        //  if (stack.length > 0) {
        //     const response = await chatSession.sendMessage(stack[stack.length - 1][0]);
        //     msg = response;
        //  }
        // const state = {
        //     chatSession: serializeChatSession(chatSession),
        //     stack: stack,
        //     seenTopics: seenTopics
        // };

        // await User.findOneAndUpdate(
        //     { username },
        //     { state: JSON.stringify(state) }
        // );
        
        const msg = "Hello, how are you?";
        res.status(200).json({
            success: true,
            message: msg
        });
    } catch (error) {
        console.error('Error in uploadProblem:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing problem upload',
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
                message: 'User not found'
            });
            return;
        }
        const chatSession = ChatSession.deserialize(user.state);
        let stack = JSON.parse(user.state).stack;
        let seenTopics = JSON.parse(user.state).seenTopics;
        let response = await chatSession.sendMessage(message);
        let mindmap = JSON.parse(user.mindmap);
        if (response === "Yes") {
            type tuple = [string, boolean];
            let element: tuple = stack.pop();
            if (element[1]) {
                mindmap.topics.push(element[0]);
            }
            response = await chatSession.sendMessage(stack[stack.length - 1][0]);
        } else if (response === "No") {
            stack[stack.length - 1][1] = true;
            let subtopics = await getPrerequisites(stack[stack.length - 1][0], seenTopics);
            if (subtopics.length > 0) {
                seenTopics = [...seenTopics, ...subtopics]
                for (const subtopic of subtopics) {
                    stack.push([subtopic, false]);
                }
                response = await chatSession.sendMessage(stack[stack.length - 1][0]);
            } else {
                response = await chatSession.sendMessage("Explain " + stack.pop()![0]);
            }
        } else {
            console.log("This is bad");
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
                message: "All topics covered! Switched to student mode. Please provide your solution to the problem.",
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
            message: response,
            done: false
        });
    } catch (error) {
        console.error('Error in sendTeacherCatMessage:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing teacher message',
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
                response = await chatSession.sendMessage(stack[stack.length - 1][0]);
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
                message: 'User not found'
            });
            return;
        }

        const chatSession = ChatSession.deserialize(user.state);
        let response = await chatSession.sendMessage(message);
        
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
                message: "Congratulations! You have successfully demonstrated your understanding of the problem and its solution.",
                isComplete: true
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
            message: response,
            isComplete: false
        });
    } catch (error) {
        console.error('Error in sendStudentCatMessage:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing student message',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}