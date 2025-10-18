// npm i @google/genai
import { GoogleGenAI, createUserContent, createPartFromUri } from "@google/genai";
import { Readable } from "stream";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function extractOneProblem(fileStream: Readable | Buffer, mimeType: string) {
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
    file: new Blob([buffer], { type: mimeType }),
    config: { mimeType }
  });

  if (!uploaded.uri) {
    throw new Error("Failed to upload file");
  }

  const prompt =
    "Choose exactly one math problem that is clearly visible in this file. " +
    "Return the problem text only (no solution, no commentary). " +
    "Preserve math symbols and line breaks as needed, plain text only.";

  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: createUserContent([
      createPartFromUri(uploaded.uri, uploaded.mimeType ?? mimeType),
      { text: prompt }
    ]),
    // responseMimeType: "text/plain", // optional
  });

  return res.text?.trim() ?? "";
}