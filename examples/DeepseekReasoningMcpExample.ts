import { getToolPrompt, parseAiResponse, API_RESULT_TAG, API_RESULT_END_TAG } from '../src/index';
import OpenAI from 'openai';
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import * as readline from 'readline';

const COLORS = {
    CYAN: '\x1b[36m',
    RESET: '\x1b[0m',
    GREEN: '\x1b[32m',
    YELLOW: '\x1b[33m'
};

interface DeepseekDelta extends OpenAI.Chat.Completions.ChatCompletionChunk.Choice.Delta {
    reasoning_content?: string;
}

async function example() {

    console.log('Deepseek Reasoning MCP Example');

    const apiKey = process.env.OPENAI_API_KEY;
    const baseURL = process.env.OPENAI_BASE_URL || 'https://api.deepseek.com';
    const modelName = process.env.OPENAI_MODEL_NAME || 'deepseek-reasoner';

    const transport = new StdioClientTransport({
        command: "npx",
        args: [
            "-y",
            "@modelcontextprotocol/server-filesystem",
            __dirname
        ]
    });
    const mcpClient = new Client(
        {
            name: "example-client",
            version: "1.0.0",
        },
        {
            capabilities: {
                tools: {}
            }
        }
    );

    await mcpClient.connect(transport);

    const tools = await mcpClient.listTools();

    const toolPacket = [
        {
            description: 'filesystem, Secure file operations with configurable access controls',
            api_list: tools
        }
    ];

    // Generate tool prompt
    const toolPrompt = getToolPrompt(toolPacket);

    const openaiClient = new OpenAI({
        apiKey: apiKey,
        baseURL: baseURL,
    });

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    function readUserInput(): Promise<string> {
        return new Promise((resolve) => {
            rl.question('Enter input (type "exit" to quit): ', (input) => {
                resolve(input);
            });
        });
    }

    let messages: any[] = [
        {
            role: 'system',
            content: `You are a helpful assistant.\n${toolPrompt}`
        }
    ];

    let requestUserInput = true;
    while (true) {
        if (requestUserInput) {
            const userInput = await readUserInput();

            if (userInput.toLowerCase() === 'exit') {
                console.log('Goodbye!');
                await mcpClient.close();
                transport.close();
                rl.close();
                process.exit(0);
            }

            messages.push({
                role: 'user',
                content: userInput
            });
        }

        const stream = await openaiClient.chat.completions.create({
            model: modelName,
            messages: messages,
            stream: true
        });

        let fullResponse = '';
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            const reasoningContent = (chunk.choices[0]?.delta as any)?.reasoning_content;
            if (content) {
                fullResponse += content;
                process.stdout.write(content);
            }

            if (reasoningContent) {
                process.stdout.write(COLORS.CYAN + reasoningContent + COLORS.RESET);
            }
        }
        process.stdout.write('\n');

        messages.push({
            role: 'assistant',
            content: fullResponse
        });

        const parsedCalls = parseAiResponse(fullResponse);
        let results: string[] = [];
        for (const call of parsedCalls) {
            const toolName = call.name;
            const callId = call.call_id;
            const toolParams = call.parameters;
            const toolResult = await mcpClient.callTool({
                name: toolName,
                arguments: toolParams
            });
            results.push(`[call_id: ${callId} name: ${toolName}] ${JSON.stringify(toolResult)}`);
        }
        if (results.length > 0) {
            let toolResultContent = `${API_RESULT_TAG}\n${results.join('\n')}\n${API_RESULT_END_TAG}`
            console.log(COLORS.GREEN + toolResultContent + COLORS.RESET);
            messages.push({
                role: 'user',
                content: toolResultContent
            });
            requestUserInput = false;
        } else {
            requestUserInput = true;
        }
    }

}

example()