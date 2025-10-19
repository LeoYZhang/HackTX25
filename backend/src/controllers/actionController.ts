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
        const problem = await extractOneProblem(file, mimeType);
        type tuple = [string, boolean];
        let stack: tuple[] = [];
        let seenTopics: string[] = JSON.parse(mindmap.topics);
        let prereqs = await getPrerequisites(problem, seenTopics);
         for (const prereq of prereqs) {
             stack.push([prereq, false]);
         }
         
         const chatSession = new ChatSession({}, true, problem);
         let msg = "";
         if (stack.length > 0) {
            const response = await chatSession.sendMessage(stack[stack.length - 1][0]);
            msg = response;
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
            message: response
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
    // try {
    //     const { username, isDone } = req.body;
    //     if (isDone) {
            
    //     }
    // }
}

export const sendStudentCatMessage = async (req: Request, res: Response): Promise<void> =>  {

}