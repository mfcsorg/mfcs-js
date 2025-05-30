/**
 * Get agent prompt
 * @param packet Agent package [{description: string, agent_api_list: [{name: string, description: string, parameters: string}]}]
 * @returns Agent prompt
 */
export function getAgentPrompt(packet: any): string {
  let prompt = `
<agent_calling>
You can use agents to solve tasks. Follow these rules about agent api calling:
1. Always strictly follow the specified agent api calling pattern and ensure all necessary parameters are provided.
2. Conversations may reference agent apis that are no longer available. Never call agent apis that are not explicitly provided.
3.**When talking to users, never mention agent api names.** For example, instead of saying "I need the editer to edit your file", say "I will edit your file".
4. Only call agent apis when necessary. If the user's task is general or you already know the answer, simply respond without calling agent apis.
5. Before calling each agent api, first explain to the user why you are calling it.
6. After each agent api use, always wait for the agent api result before continuing. Do not assume agent api usage success without explicit confirmation.
7. agent_result is automatically returned by agent api calls and is not user input. Do not treat it as user input. Do not thank the user.
8. You can only use one agent api per message, and will receive the result of that agent api use in the user's response. You use agent apis step-by-step to accomplish a given task, with each agent api use informed by the result of the previous agent api use.
9. NEVER use multiple agent apis in a single message, even if the USER requests. 

===Interface Usage===
## mfcs_agent
Description: Request to call an agent api. The agent api defines the input pattern, specifying required and optional parameters.
Parameters:
- instructions: (required) Content to be executed, actions, etc., reminding users what to do
- agent_id: (required) Agent api call ID, starting from 1, +1 for each call, use different agent_id for each agent api call
- name: (required) Name of the agent api to execute. Names can only be selected from the following agent api list. Never generate your own
- parameters: (required) A JSON object containing agent api input parameters, following the agent api's input pattern
Example:
<mfcs_agent>
<instructions>what to do</instructions>
<agent_id>call index</agent_id>
<name>agent api name here</name>
<parameters>
{
  "param1": "value1",
  "param2": "value2"
}
</parameters>
</mfcs_agent>

===Restrictions===
1. The name in mfcs_agent can only be selected from the agent api list, cannot be self-generated.
2. You should not generate agent_result content. do not assume execution result.
3. Do not put agent api calls in markdown.

</agent_calling>
<agent_api_list>
${JSON.stringify(packet)}
</agent_api_list>
    `
  return prompt
}
