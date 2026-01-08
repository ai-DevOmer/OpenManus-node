import { GoogleGenAI, FunctionCallingConfigMode, Content, Part, FunctionCall, Tool } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

/** Chat message structure for LLM interactions */
export interface ChatMessage {
  role: "system" | "user" | "assistant" | "function" | "tool" | "model";
  content?: string;
  name?: string;
  tool_call_id?: string;
  tool_calls?: {
    id: string;
    type: string;
    function: {
      name: string;
      arguments: string;
    };
  }[];
}

/** Singleton LLM class to interface with Google Gemini API */
export class LLM {
  private static _instances: { [key: string]: LLM } = {};
  private genai: GoogleGenAI;
  private model: string;

  private constructor(apiKey: string, model?: string) {
    this.model = model || process.env.GEMINI_MODEL || "gemini-2.5-flash";
    // Initialize Google Generative AI client
    this.genai = new GoogleGenAI({ apiKey });
  }

  /** Get or create a singleton LLM instance (by config name) */
  public static getInstance(configName: string = "default"): LLM {
    if (!LLM._instances[configName]) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("Missing GEMINI_API_KEY in environment.");
      LLM._instances[configName] = new LLM(apiKey);
    }
    return LLM._instances[configName];
  }

  /** Convert our ChatMessage format to Gemini Content format */
  private formatMessages(messages: ChatMessage[], systemPrompt?: string): { contents: Content[], systemInstruction?: string } {
    const contents: Content[] = [];
    let systemInstruction: string | undefined = systemPrompt;

    for (const msg of messages) {
      const { role, content, tool_calls, tool_call_id, name } = msg;

      if (role === "system") {
        // Combine system messages into system instruction
        if (systemInstruction) {
          systemInstruction += "\n" + (content ?? "");
        } else {
          systemInstruction = content ?? "";
        }
        continue;
      }

      if (role === "user") {
        contents.push({
          role: "user",
          parts: [{ text: content ?? "" }]
        });
        continue;
      }

      if (role === "assistant" || role === "model") {
        if (tool_calls && tool_calls.length > 0) {
          // Assistant message with tool calls - convert to function call format
          const parts: Part[] = [];
          if (content) {
            parts.push({ text: content });
          }
          for (const tc of tool_calls) {
            let args: Record<string, unknown> = {};
            try {
              args = JSON.parse(tc.function.arguments);
            } catch {
              args = {};
            }
            parts.push({
              functionCall: {
                name: tc.function.name,
                args: args
              }
            });
          }
          contents.push({
            role: "model",
            parts: parts
          });
        } else {
          contents.push({
            role: "model",
            parts: [{ text: content ?? "" }]
          });
        }
        continue;
      }

      if (role === "tool" || role === "function") {
        // Tool result message - convert to function response format
        contents.push({
          role: "user",
          parts: [{
            functionResponse: {
              name: name || "tool_response",
              response: { result: content ?? "" }
            }
          }]
        });
        continue;
      }
    }

    return { contents, systemInstruction };
  }

  /** Convert OpenAI tool format to Gemini function declaration format */
  private convertToolsToGemini(tools: any[]): Tool[] {
    if (!tools || tools.length === 0) return [];

    const functionDeclarations = tools.map(tool => {
      if (tool.type === "function" && tool.function) {
        const func = tool.function;
        return {
          name: func.name,
          description: func.description || "",
          parameters: func.parameters || { type: "object", properties: {} }
        };
      }
      return null;
    }).filter(Boolean);

    if (functionDeclarations.length === 0) return [];

    return [{ functionDeclarations }] as Tool[];
  }

  /** Send a prompt to the LLM and get a completion (no tool/function calling) */
  public async ask(messages: ChatMessage[]): Promise<string> {
    const { contents, systemInstruction } = this.formatMessages(messages);

    const response = await this.genai.models.generateContent({
      model: this.model,
      contents: contents,
      config: systemInstruction ? { systemInstruction } : undefined
    });

    return response.text ?? "";
  }

  /** Send a prompt to LLM with available tools (function calling mode) */
  public async askTool(params: {
    messages: ChatMessage[];
    systemMsgs?: ChatMessage[];
    tools: any[];
    toolChoice?: string | { type: string; function?: { name: string } };
  }): Promise<{
    content?: string;
    functionCall?: { name: string; arguments: string };
  }> {
    const { messages, systemMsgs = [], tools, toolChoice = "auto" } = params;

    // Get system instruction from system messages
    let systemInstruction: string | undefined;
    for (const msg of systemMsgs) {
      if (msg.role === "system" && msg.content) {
        systemInstruction = systemInstruction
          ? systemInstruction + "\n" + msg.content
          : msg.content;
      }
    }

    const { contents, systemInstruction: additionalSystem } = this.formatMessages(messages, systemInstruction);
    const finalSystemInstruction = additionalSystem || systemInstruction;

    // Convert tools to Gemini format
    const geminiTools = this.convertToolsToGemini(tools);

    // Determine function calling mode
    let functionCallingConfig: { mode: FunctionCallingConfigMode; allowedFunctionNames?: string[] } | undefined;

    if (toolChoice === "none") {
      functionCallingConfig = { mode: FunctionCallingConfigMode.NONE };
    } else if (toolChoice === "auto") {
      functionCallingConfig = { mode: FunctionCallingConfigMode.AUTO };
    } else if (typeof toolChoice === "string" && toolChoice !== "auto" && toolChoice !== "none") {
      // Specific function name
      functionCallingConfig = {
        mode: FunctionCallingConfigMode.ANY,
        allowedFunctionNames: [toolChoice]
      };
    } else if (typeof toolChoice === "object" && toolChoice.function?.name) {
      functionCallingConfig = {
        mode: FunctionCallingConfigMode.ANY,
        allowedFunctionNames: [toolChoice.function.name]
      };
    } else {
      functionCallingConfig = { mode: FunctionCallingConfigMode.AUTO };
    }

    const response = await this.genai.models.generateContent({
      model: this.model,
      contents: contents,
      config: {
        systemInstruction: finalSystemInstruction,
        tools: geminiTools.length > 0 ? geminiTools : undefined,
        toolConfig: geminiTools.length > 0 ? { functionCallingConfig } : undefined
      }
    });

    // Check for function calls
    const functionCalls = response.functionCalls;

    if (process.env.NODE_ENV === 'development') {
      console.log('Tool call:', functionCalls?.[0]);
    }

    if (functionCalls && functionCalls.length > 0) {
      const fc = functionCalls[0];
      return {
        functionCall: {
          name: fc.name ?? "",
          arguments: JSON.stringify(fc.args ?? {})
        }
      };
    } else {
      // The model provided a direct answer
      return { content: response.text ?? "" };
    }
  }
}
