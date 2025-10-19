import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

// Initialize ElevenLabs client
const elevenlabs = new ElevenLabsClient();

export const generateSpeech = async (text: string): Promise<Buffer> => {
  try {
    // Use the default voice (you can specify a different voice ID if needed)
    const audio = await elevenlabs.textToSpeech.convert('JBFqnCBsd6RMkjVDRZzb', {
      text: text,
      modelId: "eleven_monolingual_v1",
      outputFormat: "mp3_44100_128"
    });

    // Convert the audio stream to a buffer
    const chunks: Buffer[] = [];
    for await (const chunk of audio) {
      chunks.push(Buffer.from(chunk));
    }
    
    return Buffer.concat(chunks);
  } catch (error) {
    console.error('Error generating speech:', error);
    throw new Error('Failed to generate speech');
  }
};

export const getAvailableVoices = async () => {
  try {
    const voices = await elevenlabs.voices.getAll();
    return voices;
  } catch (error) {
    console.error('Error fetching voices:', error);
    throw new Error('Failed to fetch voices');
  }
};