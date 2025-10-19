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
  private isTeacherMode: boolean;
  private problem: string;

  constructor(options: GeminiQueryOptions = {}, isTeacherMode: boolean = false, problem: string = "") {
    this.options = options;
    this.isTeacherMode = isTeacherMode;
    this.problem = problem;
  }

  async getProblem(): Promise<string> {
    const contents = [
      createUserContent([{ text: `Repeat this problem in latex formatting if it has math symbols: ${this.problem}. Do not return any heading or repeat my question, just output what I asked for. Prefix with "The problem is". Make sure to fully state the problem.` }])
    ];

    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents
    });
    
    const response = res.text?.trim() ?? "";
    console.log(response);
    return response;
  }

  /**
   * Send a message and get a response from Gemini with full conversation context
   */
  async sendMessage(content: string, additionalOptions: GeminiQueryOptions = {}): Promise<string> {
    // Add user message to conversation history
    this.messages.push({ role: 'user', content });
    
    // Merge options
    const mergedOptions = { ...this.options, ...additionalOptions };
    
    // Get base prompt based on mode
    const basePrompt = this.getBasePrompt();
    
    // Convert conversation history to Gemini's expected format with base prompt
    const contents = [
      createUserContent([{ text: basePrompt }]),
      ...this.messages.map(msg => 
        createUserContent([{ text: msg.content }])
      )
    ];
    
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
   * Get the base prompt based on the mode
   */
  private getBasePrompt(): string {
    const problemContext = this.problem ? `\n\nMain problem to solve: ${this.problem}` : "";
    
    if (this.isTeacherMode) {
      return `You are a math teacher AI whose goal is to nudge the user towards solving the main problem without explicitly providing solutions.${problemContext}

Your role is to:
1) If the input is a topic related to the main problem, generate a question about that topic to test understanding and nudge the user towards solving the main problem.
2) If the input is a user response to your previous question, evaluate if the response truly shows understanding of the topic and return either "Yes." or "No.", then a brief explanation. Do not ask a question in your response.
3) If the input is related to "Explain {topic}", provide an explanation of the given topic, specifically focusing on the aspects of that topic that relate to the main problem.

CRITICAL FORMATTING RULES:
- For topic questions: Prefix the question with saying that you're going to ask a question about that topic. Ask a specific question about the topic.
- For user responses: The response string must begin with "Yes." or "No." - no other text. Make sure to include an explanation, but keep it brief. Do not ask a question in your response.
- For explanations: Provide a clear explanation of the topic
- If the user is off topic, gently nudge them back to the topic.

Do not ever provide direct solutions or answers. Only ask guiding questions, evaluate responses, or explain topics when explicitly requested.`;
    } else {
      return `You are a math learning companion AI whose goal is to test and evaluate the user's understanding of the main problem and its solution.${problemContext}

Your role is to:
1) The user's first response will contain their solution to the main problem.
2) For the rest of the conversation, ask questions to pick at the user's solutions and responses to ensure their understanding is solid.
3) If you believe the user fully understands everything necessary, return "Done". In this case, only return "Done" and nothing else.

Ask probing questions about their reasoning, methodology, and understanding of the concepts involved. Challenge their thinking to ensure deep comprehension.`;
    }
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
   * Get the teacher mode status
   */
  getIsTeacherMode(): boolean {
    return this.isTeacherMode;
  }

  /**
   * Serialize the chat session to a JSON string
   */
  serialize(): string {
    const sessionData = {
      messages: this.getHistory(),
      options: this.getOptions(),
      isTeacherMode: this.isTeacherMode,
      problem: this.problem
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
    
    // Check if this is a nested state object with chatSession property
    if (sessionData.chatSession) {
      // This is a state object, extract the chatSession
      const chatSessionData = JSON.parse(sessionData.chatSession);
      const session = new ChatSession(chatSessionData.options, chatSessionData.isTeacherMode, chatSessionData.problem);
      
      // Restore the messages array
      if (chatSessionData.messages && Array.isArray(chatSessionData.messages)) {
        session.restoreMessages(chatSessionData.messages);
      }
      
      return session;
    } else {
      // This is a direct ChatSession object
      const session = new ChatSession(sessionData.options, sessionData.isTeacherMode, sessionData.problem);
      
      // Restore the messages array
      if (sessionData.messages && Array.isArray(sessionData.messages)) {
        session.restoreMessages(sessionData.messages);
      }
      
      return session;
    }
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