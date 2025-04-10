# MFCS

Model Function Calling Standard

## Installation

```bash
npm install mfcs-js
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
  console.log('All API execution results:', results);
});

// Process streaming data
parser.processChunk('Some text', false);
parser.processChunk('<call_api><instructions>xxx</instructions><call_id>1</call_id><name>apiName</name><parameters>{"param": "value"}</parameters></call_api>', false);
parser.processChunk('More text', true); // Last chunk of data
```

#### Events

- `apiCall`: Triggered when a complete API call is parsed, parameter is the API call information.
- `apiResults`: Triggered when all API calls have results and parsing is complete, parameter is the formatted result text.

#### Methods

- `processChunk(chunk: string, isLast: boolean = false)`: Process streaming data chunk.
- `addApiResult(callId: number, name: string, result: Record<string, any>)`: Add API execution result.
- `getToolResultPrompt()`: Get tool execution result prompt.

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
npm run example
```

## License

Apache-2.0
