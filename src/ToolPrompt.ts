

/**
 * 获取工具提示
 * @param packet 工具包 [{description: string, api_list: [{name: string, description: string, parameters: string}]}]
 * @returns 工具提示
 */
export function getToolPrompt(packet: any): string {

    let prompt = `
<tool_calling>
您可以使用工具来解决任务。遵循以下关于工具调用的规则：
1.始终严格遵循指定的工具调用模式，并确保提供所有必要的参数。
2.对话可能会引用不再可用的工具。切勿调用未明确提供的工具。
3.**在与用户交谈时，切勿提及工具名称。**例如，与其说"我需要使用call_api工具来编辑您的文件"，不如说"我将编辑您的档案"。
4.只有在必要时才调用工具。如果用户的任务是一般性的，或者您已经知道答案，只需在不调用工具的情况下进行响应。
5.在调用每个工具之前，首先向用户解释您为什么调用它。
6.在每次工具使用后，请始终等待工具使用结果，然后再继续。不要在没有明确确认结果的情况下假设工具使用成功。
7.工具调用不要放在markdown中。
8.api_result是工具调用自动返回的，并不是用户输入的。不要当作用户输入。不要感谢用户。

===接口使用===
## call_api
描述：请求调用API。API定义了输入模式，指定必需和可选参数。
参数：
- instructions: (required) 将要执行的内容，动作等，提醒用户要做什么
- call_id: (required) 工具调用ID，从1开始，每次调用+1，每个api调用使用不同的call_id
- name: (required) 要执行的API的名称。名称只能从后面的api列表中选择。绝对不能自己生成
- parameters: (required) 一个包含API输入参数的JSON对象，遵循API的输入模式
示例：
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

===限制===
1.call_api中的name只能从api列表中选择，不能自己生成。

</tool_calling>
<api_list>
${JSON.stringify(packet)}
</api_list>
    `
    return prompt
}