# MFCS

Model Function Calling Standard

## Installation

```bash
npm install mfcs-js
```

or clone from github

```bash
git clone --recurse-submodules https://github.com/mfcsorg/mfcs-js.git
cd mfcs-js
git submodule update --init --recursive
npm run install
```

## Features

### AI Response Parser (AiResponseParser)

The `AiResponseParser` class is used to parse streaming AI responses, handle TOOL calls and results. It can extract TOOL call information from streaming data and notify external systems to execute the corresponding TOOL calls through an event mechanism, then return the results to the AI.

#### Main Features

1. **Parse Streaming AI Responses**: Process streaming data input in small chunks, parsing out complete TOOL call information.
2. **Event Notification**: When a complete TOOL call is parsed, notify external systems to execute the corresponding TOOL call through events.
3. **Result Collection**: Collect all TOOL call execution results, and return formatted results through events when all TOOL calls are completed.

#### Usage

```typescript
import { AiResponseParser } from 'mfcs';

// Create parser instance
const parser = new AiResponseParser();

// Listen for TOOL call events
parser.on('toolCall', (toolCall) => {
  console.log('Received TOOL call:', toolCall);
  
  // Execute TOOL call
  // ...
  
  // Add TOOL execution result
  parser.addToolResult(
    toolCall.call_id,
    toolCall.name,
    { success: true, message: 'TOOL executed successfully' }
  );
});

// Listen for TOOL results events
parser.on('toolResults', (results) => {
  if (results) {
      console.log('All TOOL execution results:', results);
  } else {
      console.log('No TOOL execution');
  }
});

// Process streaming data
parser.processChunk('Some text', false);
parser.processChunk('<tool_call><instructions>xxx</instructions><call_id>1</call_id><name>toolName</name><parameters>{"param": "value"}</parameters></tool_call>', false);
parser.processChunk('More text', true); // Last chunk of data
```

#### Events

- `toolCall`: Triggered when a complete TOOL call is parsed, parameter is the TOOL call information.
- `toolResults`: Triggered when all TOOL calls have results and parsing is complete, parameter is the formatted result text.

#### Methods

- `processChunk(chunk: string, isLast: boolean = false)`: Process streaming data chunk.
- `addToolResult(callId: number, name: string, result: Record<string, any>)`: Add TOOL execution result.
- `getToolResultPrompt()`: Get tool execution result prompt.

### AI Response Parse Function (parseAiResponse)

The `parseAiResponse` function is used to parse AI responses containing one or more TOOL call blocks. It extracts structured information from the response text and returns an array of TOOL call objects.

#### Main Features

1. **Parse Multiple TOOL Calls**: Extract all TOOL call blocks from a response text.
2. **Structured Data**: Return parsed data in a structured format with typed fields.
3. **Error Handling**: Handle JSON parsing errors gracefully.

#### Usage

```typescript
import { parseAiResponse } from 'mfcs';

// Example response text with multiple TOOL calls
const response = `
<tool_call>
<instructions>Get user information</instructions>
<call_id>call_123</call_id>
<name>getUserInfo</name>
<parameters>
{
  "userId": "12345",
  "includeProfile": true
}
</parameters>
</tool_call>

<tool_call>
<instructions>Update user settings</instructions>
<call_id>call_456</call_id>
<name>updateUserSettings</name>
<parameters>
{
  "theme": "dark",
  "notifications": false
}
</parameters>
</tool_call>
`;

// Parse the response
const toolCalls = parseAiResponse(response);
console.log(toolCalls);

// Access specific TOOL call information
if (toolCalls.length > 0) {
  console.log(`Instructions: ${toolCalls[0].instructions}`);
  console.log(`Call ID: ${toolCalls[0].call_id}`);
  console.log(`TOOL Name: ${toolCalls[0].name}`);
  console.log(`Parameters:`, toolCalls[0].parameters);
}
```

#### Return Type

The function returns an array of `ToolCall` objects with the following structure:

```typescript
interface ToolCall {
  instructions: string;
  call_id: string;
  name: string;
  parameters: Record<string, any>;
}
```

### Tool Prompt Generator

The `getToolPrompt` function is used to generate tool prompts, including TOOL list and calling rules.

```typescript
import { getToolPrompt } from 'mfcs';

const packet = {
  'user': {
    description: 'User-related TOOLs',
    tool_list: [
      {
        name: "getProductList",
        description: "Get product list",
        parameters: {
            type: "object",
            properties: {
                page: {
                    type: "number",
                    description: "Page number",
                },
                limit: {
                    "type": "number",
                    "description": "Items per page",
                },
            },
            required: ["page", "limit"],
        },
        returns: {
            type: "array",
            description: "Product list",
        }
      }
    ]
  }
};

const prompt = getToolPrompt(packet);
console.log(prompt);
```

## Examples

Run examples:

```bash
npm install
npm run example:parser
npm run example:parse
npm run example:toolprompt

# Windows
set OPENAI_API_KEY=your_api_key_here
# Linux/Mac
export OPENAI_API_KEY=your_api_key_here

npm run example:reasoningmcp
npm run example:openapiToolExample
npm run example:pythonToolExample
```

## License

MIT license
