import { ManusWeb } from "../../app/agent/manus_web";
import type { Context } from "@netlify/functions";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

export default async (req: Request, context: Context) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const body = await req.json() as { prompt?: string; action?: string };
    const prompt = body.prompt;
    const action = body.action || "chat";

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Missing prompt" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    const agent = new ManusWeb();
    const result = await agent.run(prompt);

    return new Response(JSON.stringify({ result, action, success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  } catch (error: any) {
    console.error("Agent Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error", success: false }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
};

export const config = {
  path: "/api/agent"
};
