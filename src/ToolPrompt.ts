/**
 * Get tool prompt
 * @param packet Tool package [{description: string, api_list: [{name: string, description: string, parameters: string}]}]
 * @returns Tool prompt
 */
export function getToolPrompt(packet: any): string {

  let prompt = `
<tool_calling>
You can use tools to solve tasks. Follow these rules about tool calling:
1. Always strictly follow the specified tool calling pattern and ensure all necessary parameters are provided.
2. Conversations may reference tools that are no longer available. Never call tools that are not explicitly provided.
3.**When talking to users, never mention tool names.** For example, instead of saying "I need to use the call_api tool to edit your file", say "I will edit your file".
4. Only call tools when necessary. If the user's task is general or you already know the answer, simply respond without calling tools.
5. Before calling each tool, first explain to the user why you are calling it.
6. After each tool use, always wait for the tool usage result before continuing. Do not assume tool usage success without explicit confirmation.
7. You can call multiple APIs simultaneously if they don't have sequential dependencies
8. api_result is automatically returned by tool calls and is not user input. Do not treat it as user input. Do not thank the user.

===Interface Usage===
## call_api
Description: Request to call an API. The API defines the input pattern, specifying required and optional parameters.
Parameters:
- instructions: (required) Content to be executed, actions, etc., reminding users what to do
- call_id: (required) Tool call ID, starting from 1, +1 for each call, use different call_id for each api call
- name: (required) Name of the API to execute. Names can only be selected from the following api list. Never generate your own
- parameters: (required) A JSON object containing API input parameters, following the API's input pattern
Example:
<call_api>
<instructions>xxx</instructions>
<call_id>call api index</call_id>
<name>api name here</name>
<parameters>
{
  "param1": "value1",
  "param2": "value2"
}
</parameters>
</call_api>

===Restrictions===
1. The name in call_api can only be selected from the api list, cannot be self-generated.
2. You should not generate api_result content. do not assume tool execution result.
3. Do not put tool calls in markdown.

</tool_calling>
<api_list>
${JSON.stringify(packet)}
</api_list>
    `
  return prompt
}
