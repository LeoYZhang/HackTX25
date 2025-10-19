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
    model = "gemini-2.5-flash-lite",
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
    model = "gemini-2.5-flash-lite",
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

/**
 * Interface for conversation messages
 */
export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Chat session class that maintains conversation context
 */
export class ChatSession {
  private messages: ConversationMessage[] = [];
  private options: GeminiQueryOptions;

  constructor(options: GeminiQueryOptions = {}) {
    this.options = options;
  }

  /**
   * Send a message and get a response from Gemini with full conversation context
   */
  async sendMessage(content: string, additionalOptions: GeminiQueryOptions = {}): Promise<string> {
    // Add user message to conversation history
    this.messages.push({ role: 'user', content });
    
    // Merge options
    const mergedOptions = { ...this.options, ...additionalOptions };
    
    // Convert conversation history to Gemini's expected format
    const contents = this.messages.map(msg => 
      createUserContent([{ text: msg.content }])
    );
    
    const res = await ai.models.generateContent({
      model: mergedOptions.model || "gemini-2.5-flash-lite",
      contents
    });
    
    const response = res.text?.trim() ?? "";
    
    // Add assistant response to conversation history
    this.messages.push({ role: 'assistant', content: response });
    
    return response;
  }

  /**
   * Get the current conversation history
   */
  getHistory(): ConversationMessage[] {
    return [...this.messages];
  }

  /**
   * Clear the conversation history
   */
  clearHistory(): void {
    this.messages = [];
  }

  /**
   * Get the number of messages in the conversation
   */
  getMessageCount(): number {
    return this.messages.length;
  }

  /**
   * Update the default options for this session
   */
  updateOptions(newOptions: GeminiQueryOptions): void {
    this.options = { ...this.options, ...newOptions };
  }

  /**
   * Get the current options for this session
   */
  getOptions(): GeminiQueryOptions {
    return { ...this.options };
  }

  /**
   * Serialize the chat session to a JSON string
   */
  serialize(): string {
    const sessionData = {
      messages: this.getHistory(),
      options: this.getOptions()
    };
    return JSON.stringify(sessionData);
  }

  /**
   * Restore messages to the session (internal method for deserialization)
   */
  private restoreMessages(messages: ConversationMessage[]): void {
    this.messages = [...messages];
  }

  /**
   * Create a new ChatSession from serialized data
   */
  static deserialize(serializedData: string): ChatSession {
    const sessionData = JSON.parse(serializedData);
    const session = new ChatSession(sessionData.options);
    
    // Restore the messages array
    if (sessionData.messages && Array.isArray(sessionData.messages)) {
      session.restoreMessages(sessionData.messages);
    }
    
    return session;
  }
}

/**
 * Serialize a ChatSession to a JSON string
 * @param session The ChatSession to serialize
 * @returns JSON string representation of the session
 */
export function serializeChatSession(session: ChatSession): string {
  return session.serialize();
}

/**
 * Deserialize a ChatSession from a JSON string
 * @param serializedData JSON string representation of the session
 * @returns Restored ChatSession instance
 */
export function deserializeChatSession(serializedData: string): ChatSession {
  return ChatSession.deserialize(serializedData);
}

/**
 * Create a deep copy of a ChatSession
 * @param session The ChatSession to clone
 * @returns A new ChatSession with the same state
 */
export function cloneChatSession(session: ChatSession): ChatSession {
  const serialized = session.serialize();
  return deserializeChatSession(serialized);
}