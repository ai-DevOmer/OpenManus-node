# OMAR AGENT

## Project Introduction

OMAR AGENT is a powerful Node.js and TypeScript-based AI agent platform. It provides a general-purpose AI agent capable of performing complex, multi-step tasks autonomously. By leveraging powerful Large Language Models (LLMs) like Gemini 2.5 Flash, OMAR AGENT can understand user instructions, break down tasks, use external tools, and generate solutions without requiring constant human guidance.

## Installation and Usage

Follow these steps to set up and run OMAR AGENT on your local machine. Ensure you have **Node.js (v18 or newer)** and **npm** (or Yarn) installed.

1. **Clone the Project**:
   (Project files are already present)
   
2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Environment Variables**: OMAR AGENT requires a Gemini API key. Create a `.env` file in the project root:
   ```bash
   GEMINI_API_KEY=your_gemini_api_key
   ```
   
4. **Build the Project**:
   ```bash
   npm run build
   ```

5. **Run OMAR AGENT**:
   ```bash
   npm start
   ```

## Feature List

- **Autonomous Task Execution**: Give OMAR AGENT a high-level goal, and it will autonomously break the task into sub-tasks and solve it step by step.
- **LLM Integration**: Powered by Gemini 2.5 Flash for fast and accurate reasoning.
- **Web Browsing Tool**: Can perform web searches and navigate webpages.
- **Code Execution Tool**: Capable of writing and running code to solve problems.
- **System Command & File Management**: Can interact with the operating system to create or read files.

## License

Copyright (c) 2026 OMAR AGENT. All rights reserved.