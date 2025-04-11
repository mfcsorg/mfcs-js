import { parseAiResponse } from '../src/index';

// Example response text
const exampleResponse = `
Test example

<call_api>
<instructions>Get user information</instructions>
<call_id>call_123</call_id>
<name>getUserInfo</name>
<parameters>
{
  "userId": "12345",
  "includeProfile": true
}
</parameters>
</call_api>

<call_api>
<instructions>Update user settings</instructions>
<call_id>call_456</call_id>
<name>updateUserSettings</name>
<parameters>
{
  "theme": "dark",
  "notifications": false
}
</parameters>
</call_api>

End
`;

// Usage example
const parsedCalls = parseAiResponse(exampleResponse);
console.log('Parsing results:');
console.log(JSON.stringify(parsedCalls, null, 2));

// Access specific API call
if (parsedCalls.length > 0) {
  console.log('\nFirst API call:');
  console.log(`Instructions: ${parsedCalls[0].instructions}`);
  console.log(`Call ID: ${parsedCalls[0].call_id}`);
  console.log(`API Name: ${parsedCalls[0].name}`);
  console.log(`Parameters:`, parsedCalls[0].parameters);
} 