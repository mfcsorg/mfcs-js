import { parseAiResponse } from '../src/index';

// Example response text
const exampleResponse = `
Test example

<mfcs_tool>
<instructions>Get user information</instructions>
<call_id>call_123</call_id>
<name>getUserInfo</name>
<parameters>
{
  "userId": "12345",
  "includeProfile": true
}
</parameters>
</mfcs_tool>

<mfcs_tool>
<instructions>Update user settings</instructions>
<call_id>call_456</call_id>
<name>updateUserSettings</name>
<parameters>
{
  "theme": "dark",
  "notifications": false
}
</parameters>
</mfcs_tool>

End
`;

// Usage example
const parsedCalls = parseAiResponse(exampleResponse);
console.log('Parsing results:');
console.log(JSON.stringify(parsedCalls, null, 2));

// Access specific TOOL call
if (parsedCalls.length > 0) {
  console.log('\nFirst TOOL call:');
  console.log(`Instructions: ${parsedCalls[0].instructions}`);
  console.log(`Call ID: ${parsedCalls[0].call_id}`);
  console.log(`TOOL Name: ${parsedCalls[0].name}`);
  console.log(`Parameters:`, parsedCalls[0].parameters);
} 