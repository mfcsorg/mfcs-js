import { getToolPrompt, parseAiResponse, API_RESULT_TAG, API_RESULT_END_TAG } from '../src/index';
import OpenAI from 'openai';
import * as readline from 'readline';
import axios from 'axios';
import { spawn } from 'child_process';
import * as path from 'path';

const COLORS = {
    CYAN: '\x1b[36m',
    RESET: '\x1b[0m',
    GREEN: '\x1b[32m',
    YELLOW: '\x1b[33m'
};

interface ToolParameters {
    query: string;
}

async function python_query(toolParams: { query: string }) {
    return new Promise((resolve, reject) => {
        const pythonScript = path.join(__dirname, 'PythonHttpSearch.py');
        const env = { ...process.env, PYTHONIOENCODING: 'utf-8' };
        const pythonProcess = spawn('python', [pythonScript, '-q', toolParams.query], { env });

        let output = '';
        let errorOutput = '';

        pythonProcess.stdout.on('data', (data) => {
            output += data.toString('utf-8');
        });

        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString('utf-8');
        });

        pythonProcess.on('close', (code) => {
            if (code === 0) {
                resolve(output.trim());
            } else {
                reject(new Error(`Python script execution failed: ${errorOutput}`));
            }
        });
    });
}

async function example() {
    console.log('OpenAPI call example, please input the content to search');

    const apiKey = process.env.OPENAI_API_KEY;
    const baseURL = process.env.OPENAI_BASE_URL || 'https://api.deepseek.com';
    const modelName = process.env.OPENAI_MODEL_NAME || 'deepseek-chat';

    const toolPacket = [
        {
            description: 'Search Related API',
            api_list: [{
                name: "python_query",
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
            if (toolName == "python_query") {
                const toolResult = await python_query(toolParams);
                results.push(`[call_id: ${callId} name: ${toolName}] ${JSON.stringify(toolResult)}`);
            } else {
                results.push(`[call_id: ${callId} name: ${toolName}] Tool not implemented`);
            }
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