# OMAR AGENT

## 项目介绍

OMAR AGENT 是一个基于 Node.js 和 TypeScript 的强大 AI 智能体平台。它提供了一个通用的 AI 智能体，能够自主执行复杂的多步骤任务。通过集成强大的大语言模型（如 Gemini 2.5 Flash），OMAR AGENT 可以理解用户指令，将任务拆解为子任务，调用外部工具，并在无需人工持续干预的情况下生成解决方案。

## 安装与使用

请按照以下步骤在本地机器上设置并运行 OMAR AGENT。确保已安装 **Node.js (v18 或更高版本)** 和 **npm**。

1. **安装依赖**：
   ```bash
   npm install
   ```

2. **设置环境变量**：OMAR AGENT 需要 Gemini API 密钥。在项目根目录下创建一个 `.env` 文件：
   ```bash
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. **构建项目**：
   ```bash
   npm run build
   ```

4. **运行 OMAR AGENT**：
   ```bash
   npm start
   ```

## 功能列表

- **自主任务执行**：给定一个高层目标，OMAR AGENT 会自动拆解任务并逐步解决。
- **LLM 集成**：由 Gemini 2.5 Flash 驱动，推理快速准确。
- **网页浏览工具**：可以进行网络搜索和浏览网页。
- **代码执行工具**：能够编写并运行代码以解决问题。
- **系统命令与文件管理**：可以与操作系统交互以创建 or 读取文件。

## 许可证

Copyright (c) 2026 OMAR AGENT. All rights reserved.