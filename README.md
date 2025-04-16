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

The `AiResponseParser` class is used to parse streaming AI responses, handle API calls and results. It can extract API call information from streaming data and notify external systems to execute the corresponding API calls through an event mechanism, then return the results to the AI.

#### Main Features

1. **Parse Streaming AI Responses**: Process streaming data input in small chunks, parsing out complete API call information.
2. **Event Notification**: When a complete API call is parsed, notify external systems to execute the corresponding API call through events.
3. **Result Collection**: Collect all API call execution results, and return formatted results through events when all API calls are completed.

#### Usage

```typescript
import { AiResponseParser } from 'mfcs';

// Create parser instance
const parser = new AiResponseParser();

// Listen for API call events
parser.on('apiCall', (apiCall) => {
  console.log('Received API call:', apiCall);
  
  // Execute API call
  // ...
  
  // Add API execution result
  parser.addApiResult(
    apiCall.call_id,
    apiCall.name,
    { success: true, message: 'API executed successfully' }
  );
});

// Listen for API results events
parser.on('apiResults', (results) => {
  if (results) {
      console.log('All API execution results:', results);
  } else {
      console.log('No API execution');
  }
});

// Process streaming data
parser.processChunk('Some text', false);
parser.processChunk('<mfcs_call><instructions>xxx</instructions><call_id>1</call_id><name>apiName</name><parameters>{"param": "value"}</parameters></mfcs_call>', false);
parser.processChunk('More text', true); // Last chunk of data
```

#### Events

- `apiCall`: Triggered when a complete API call is parsed, parameter is the API call information.
- `apiResults`: Triggered when all API calls have results and parsing is complete, parameter is the formatted result text.

#### Methods

- `processChunk(chunk: string, isLast: boolean = false)`: Process streaming data chunk.
- `addApiResult(callId: number, name: string, result: Record<string, any>)`: Add API execution result.
- `getToolResultPrompt()`: Get tool execution result prompt.

### AI Response Parse Function (parseAiResponse)

The `parseAiResponse` function is used to parse AI responses containing one or more API call blocks. It extracts structured information from the response text and returns an array of API call objects.

#### Main Features

1. **Parse Multiple API Calls**: Extract all API call blocks from a response text.
2. **Structured Data**: Return parsed data in a structured format with typed fields.
3. **Error Handling**: Handle JSON parsing errors gracefully.

#### Usage

```typescript
import { parseAiResponse } from 'mfcs';

// Example response text with multiple API calls
const response = `
<mfcs_call>
<instructions>Get user information</instructions>
<call_id>call_123</call_id>
<name>getUserInfo</name>
<parameters>
{
  "userId": "12345",
  "includeProfile": true
}
</parameters>
</mfcs_call>

<mfcs_call>
<instructions>Update user settings</instructions>
<call_id>call_456</call_id>
<name>updateUserSettings</name>
<parameters>
{
  "theme": "dark",
  "notifications": false
}
</parameters>
</mfcs_call>
`;

// Parse the response
const apiCalls = parseAiResponse(response);
console.log(apiCalls);

// Access specific API call information
if (apiCalls.length > 0) {
  console.log(`Instructions: ${apiCalls[0].instructions}`);
  console.log(`Call ID: ${apiCalls[0].call_id}`);
  console.log(`API Name: ${apiCalls[0].name}`);
  console.log(`Parameters:`, apiCalls[0].parameters);
}
```

#### Return Type

The function returns an array of `ApiCall` objects with the following structure:

```typescript
interface ApiCall {
  instructions: string;
  call_id: string;
  name: string;
  parameters: Record<string, any>;
}
```

### Tool Prompt Generator

The `getToolPrompt` function is used to generate tool prompts, including API list and calling rules.

```typescript
import { getToolPrompt } from 'mfcs';

const packet = {
  'user': {
    description: 'User-related APIs',
    api_list: [
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
