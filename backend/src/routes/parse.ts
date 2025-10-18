import { queryGeminiWithFile } from "../utils/gemini";
import { Readable } from "stream";

export async function extractOneProblem(fileStream: Readable | Buffer, mimeType: string) {
  const prompt =
    "Choose exactly one math problem that is clearly visible in this file. " +
    "Return the problem text only (no solution, no commentary). " +
    "Preserve math symbols and line breaks as needed, plain text only.";

  return queryGeminiWithFile(fileStream, prompt, { mimeType });
}