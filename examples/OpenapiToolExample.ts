import { getToolPrompt, parseAiResponse, TOOL_RESULT_TAG, TOOL_RESULT_END_TAG } from '../src/index';
import OpenAI from 'openai';
import * as readline from 'readline';
import axios from 'axios';

const COLORS = {
    CYAN: '\x1b[36m',
    RESET: '\x1b[0m',
    GREEN: '\x1b[32m',
    YELLOW: '\x1b[33m'
};

interface ToolParameters {
    query: string;
}

async function http_query(toolParams: { query: string }) {
    try {
        const encodedQuery = encodeURIComponent(toolParams.query);
        const url = `https://r.jina.ai/https://www.bing.com/search?q=${encodedQuery}`;
        const headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        const response = await axios.get(url, { headers });

        // Limit response data to 15000 characters
        let responseData = response.data;
        if (typeof responseData === 'string' && responseData.length > 15000) {
            responseData = responseData.substring(0, 15000) + '... (content truncated)';
        } else if (typeof responseData === 'object') {
            // If it's an object, convert to string then limit length
            const dataStr = JSON.stringify(responseData);
            if (dataStr.length > 15000) {
                responseData = JSON.parse(dataStr.substring(0, 15000) + '..."} (content truncated)');
            }
        }

        return responseData;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            return `Error performing search: ${error.message}`;
        }
        return `Unexpected error: ${error}`;
    }
}

async function example() {
    console.log('OpenAPI call example, please input the content to search');

    const apiKey = process.env.OPENAI_API_KEY;
    const baseURL = process.env.OPENAI_BASE_URL || 'https://api.deepseek.com';
    const modelName = process.env.OPENAI_MODEL_NAME || 'deepseek-chat';

    const toolPacket = [
        {
            description: 'Search Related TOOL',
            tool_list: [{
                name: "http_query",
                description: "Search Engine Query",
                parameters: {
                    type: "object",
                    properties: {
                        query: {
                            type: "string",
                            description: "Content to be searched"
                        }
                    },
                    required: ["query"]
                }
            }]
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
            content: `Please search for the content provided by the user.\n${toolPrompt}`
        }
    ];

    let requestUserInput = true;
    while (true) {
        if (requestUserInput) {
            const userInput = await readUserInput();

            if (userInput.toLowerCase() === 'exit') {
                console.log('Goodbye!');
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
            const toolParams = call.parameters as ToolParameters;
            if (toolName == "http_query") {
                const toolResult = await http_query(toolParams);
                results.push(`[call_id: ${callId} name: ${toolName}] ${JSON.stringify(toolResult)}`);
            } else {
                results.push(`[call_id: ${callId} name: ${toolName}] Tool not implemented`);
            }
        }
        if (results.length > 0) {
            let toolResultContent = `${TOOL_RESULT_TAG}\n${results.join('\n')}\n${TOOL_RESULT_END_TAG}`
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