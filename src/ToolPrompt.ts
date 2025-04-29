/**
 * Get tool prompt
 * @param packet Tool package [{description: string, tool_list: [{name: string, description: string, parameters: string}]}]
 * @returns Tool prompt
 */
export function getToolPrompt(packet: any): string {
  let prompt = `
<tool_calling>
You can use tools to solve tasks. Follow these rules about tool calling:
1. Always strictly follow the specified tool calling pattern and ensure all necessary parameters are provided.
2. Conversations may reference tools that are no longer available. Never call tools that are not explicitly provided.
3.**When talking to users, never mention tool names.** For example, instead of saying "I need to use the edit_tool to edit your file", say "I will edit your file".
4. Only call tools when necessary. If the user's task is general or you already know the answer, simply respond without calling tools.
5. Before calling each tool, first explain to the user why you are calling it.
6. After each tool use, always wait for the tool result before continuing. Do not assume tool usage success without explicit confirmation.
7. tool_result is automatically returned by tool calls and is not user input. Do not treat it as user input. Do not thank the user.
8. You can only use one tool per message, and will receive the result of that tool use in the user's response. You use tools step-by-step to accomplish a given task, with each tool use informed by the result of the previous tool use.
9. NEVER use multiple tools in a single message, even if the USER requests. 

===Interface Usage===
## mfcs_tool
Description: Request to call an tool. The tool defines the input pattern, specifying required and optional parameters.
Parameters:
- instructions: (required) Content to be executed, actions, etc., reminding users what to do
- call_id: (required) Tool call ID, starting from 1, +1 for each call, use different call_id for each tool call
- name: (required) Name of the tool to execute. Names can only be selected from the following tool list. Never generate your own
- parameters: (required) A JSON object containing tool input parameters, following the tool's input pattern
Example:
<mfcs_tool>
<instructions>what to do</instructions>
<call_id>call tool index</call_id>
<name>tool name here</name>
<parameters>
{
  "param1": "value1",
  "param2": "value2"
}
</parameters>
</mfcs_tool>

===Restrictions===
1. The name in mfcs_tool can only be selected from the tool list, cannot be self-generated.
2. You should not generate tool_result content. do not assume tool execution result.
3. Do not put tool calls in markdown.

</tool_calling>

<tool_list>
${JSON.stringify(packet)}
</tool_list>
    `
  return prompt
}
