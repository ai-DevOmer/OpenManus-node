import { Manus } from "./agent/manus";
import { PlanningFlow } from "./flow/planning";
import * as readline from "readline";
import dotenv from "dotenv";
import logger from "./logger";

// 暂时注释掉代理设置，以便应用程序可以启动
// import proxy from "node-global-proxy";
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
// 
// console.log(proxy);
// // 代理设置在ESM模式下可能需要不同的导入方式
// // 暂时跳过代理设置

dotenv.config();

// 记录应用启动
logger.highlight("OMAR AGENT (Node.js) - 应用启动");

    // Create the agent (OmarAgent implements the tool-use loop)
    const agent = new Manus();

    // Start the interactive loop
// const flow = new PlanningFlow();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
console.log("OMAR AGENT (Node.js) – Enter your prompt (or 'exit' to quit):");
rl.prompt();
rl.on("line", async (input) => {
  const query = input.trim();
  if (query.toLowerCase() === "exit" || query.toLowerCase() === "quit") {
    logger.info("用户请求退出应用");
    rl.close();
    return;
  }
  if (!query) {
    rl.prompt();
    return;
  }
  try {
    logger.highlight(`接收到用户请求: "${query}"`);
    console.log("Processing your request...");
    // Use the OmarAgent to handle the query
    const result = await agent.run(query);
    logger.success("Agent完成请求处理");
    console.log(`Agent: ${result}`);
  } catch (err: any) {
    logger.error_detail(`处理请求时发生错误: ${err.message}`);
    console.error("Error:", err.message);
  }
  console.log("\nEnter your prompt (or 'exit' to quit):");
  rl.prompt();
});
rl.on("close", () => {
  logger.success("应用关闭");
  console.log("Goodbye!");
  process.exit(0);
});
