import { GoogleGenAI, createUserContent, createPartFromUri } from "@google/genai";
import { Readable } from "stream";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export interface GeminiQueryOptions {
  model?: string;
  responseMimeType?: string;
  temperature?: number;
  maxOutputTokens?: number;
}

export interface FileUploadOptions {
  mimeType: string;
}

/**
 * Generalizable function to query Google Gemini with text prompt
 */
export async function queryGemini(
  prompt: string,
  options: GeminiQueryOptions = {}
): Promise<string> {
  const {
    model = "gemini-2.5-flash",
    responseMimeType,
    temperature,
    maxOutputTokens
  } = options;

  const res = await ai.models.generateContent({
    model,
    contents: createUserContent([{ text: prompt }])
  });

  return res.text?.trim() ?? "";
}

/**
 * Generalizable function to query Google Gemini with file upload
 */
export async function queryGeminiWithFile(
  fileStream: Readable | Buffer,
  prompt: string,
  fileOptions: FileUploadOptions,
  queryOptions: GeminiQueryOptions = {}
): Promise<string> {
  // Convert stream to Buffer if needed, then to Blob
  let buffer: Buffer;
  if (fileStream instanceof Buffer) {
    buffer = fileStream;
  } else {
    const chunks: Buffer[] = [];
    for await (const chunk of fileStream) {
      chunks.push(chunk);
    }
    buffer = Buffer.concat(chunks);
  }
  
  const uploaded = await ai.files.upload({
    file: new Blob([buffer], { type: fileOptions.mimeType }),
    config: { mimeType: fileOptions.mimeType }
  });

  if (!uploaded.uri) {
    throw new Error("Failed to upload file");
  }

  const {
    model = "gemini-2.5-flash",
    responseMimeType,
    temperature,
    maxOutputTokens
  } = queryOptions;

  const res = await ai.models.generateContent({
    model,
    contents: createUserContent([
      createPartFromUri(uploaded.uri, uploaded.mimeType ?? fileOptions.mimeType),
      { text: prompt }
    ])
  });

  return res.text?.trim() ?? "";
}