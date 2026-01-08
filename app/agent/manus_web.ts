import { ToolCallAgent } from "./toolcall";
import { ToolCollection } from "../tool/base";
import { DuckDuckGoSearch } from "../tool/duckduckgo_search";
import { PlanningTool } from "../tool/planning";
import { CreateChatCompletion } from "../tool/create_chat_completion";
import { Terminate } from "../tool/terminate";

// Custom Prompts for Web Environment
const WEB_SYSTEM_PROMPT = "You are OMAR AGENT, a helpful AI assistant running in a web environment. You can help users with planning, searching the web, and general questions. Note that you do not have access to the local file system or python execution in this mode.";

const WEB_NEXT_STEP_PROMPT = `You have access to the following tools:

PlanningTool: Use this to create a plan for complex tasks.
DuckDuckGoSearch: Use this to search the internet for information.
CreateChatCompletion: Use this to generate text or code.
Terminate: Use this when you have completed the task or need to ask the user a question.

Select the most appropriate tool to help the user. Since you are in a serverless web environment, focus on providing information and answers directly.`;

/** OmarAgentWeb: A web-safe version of OmarAgent for Netlify Functions */
export class ManusWeb extends ToolCallAgent {
  constructor(options: any = {}) {
    super({
      name: "OmarAgent",
      description: "A versatile agent that can solve various tasks using multiple tools (Web Safe)",
      system_prompt: WEB_SYSTEM_PROMPT,
      next_step_prompt: WEB_NEXT_STEP_PROMPT,
      max_steps: options.max_steps ?? 50
    });
    // Define a safe set of tools for Web/Serverless environment
    this["available_tools"] = new ToolCollection(
      new PlanningTool(),
      new CreateChatCompletion(),
      new Terminate(),
      new DuckDuckGoSearch()
    );
  }
}
