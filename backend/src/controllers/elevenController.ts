
import { Request, Response } from 'express';
import { generateSpeech } from "../utils/tts";

export const generateTTS = async (req: Request, res: Response): Promise<void> => {
    try {
        const { text } = req.body;
        
        if (!text || typeof text !== 'string') {
            res.status(400).json({
                success: false,
                message: 'Text is required and must be a string'
            });
            return;
        }

        // Generate speech using ElevenLabs
        const audioBuffer = await generateSpeech(text);
        
        // Set appropriate headers for audio response
        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': audioBuffer.length.toString(),
            'Cache-Control': 'no-cache'
        });
        
        // Send the audio buffer
        res.send(audioBuffer);
    } catch (error) {
        console.error('Error in generateTTS:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating speech',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}