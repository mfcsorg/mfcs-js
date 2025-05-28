/**
 * 解析AI响应中的tool_call部分
 * @param response AI响应文本
 * @returns 解析后的TOOL调用数组
 */
export interface ToolCall {
    instructions: string;
    call_id: string;
    name: string;
    parameters: Record<string, any>;
    type: string;
}

export function parseAiResponse(response: string): ToolCall[] {
    const toolCalls: ToolCall[] = [];

    // 使用正则表达式匹配所有call_tool块
    const toolCallRegex = /<mfcs_tool>([\s\S]*?)<\/mfcs_tool>/g;
    let match;

    while ((match = toolCallRegex.exec(response)) !== null) {
        const toolCallBlock = match[1];

        // 解析各个字段
        const instructionsMatch = /<instructions>(.*?)<\/instructions>/s.exec(toolCallBlock);
        const callIdMatch = /<call_id>(.*?)<\/call_id>/s.exec(toolCallBlock);
        const nameMatch = /<name>(.*?)<\/name>/s.exec(toolCallBlock);
        const parametersMatch = /<parameters>([\s\S]*?)<\/parameters>/s.exec(toolCallBlock);

        if (instructionsMatch && callIdMatch && nameMatch && parametersMatch) {
            try {
                const parameters = JSON.parse(parametersMatch[1].trim());

                toolCalls.push({
                    instructions: instructionsMatch[1].trim(),
                    call_id: callIdMatch[1].trim(),
                    name: nameMatch[1].trim(),
                    parameters,
                    type: "mfcs_tool"
                });
            } catch (error) {
                console.error('解析参数JSON失败:', error);
            }
        }
    }


    // 使用正则表达式匹配所有call_tool块
    const agentCallRegex = /<mfcs_agent>([\s\S]*?)<\/mfcs_agent>/g;

    while ((match = agentCallRegex.exec(response)) !== null) {
        const toolCallBlock = match[1];

        // 解析各个字段
        const instructionsMatch = /<instructions>(.*?)<\/instructions>/s.exec(toolCallBlock);
        const callIdMatch = /<agent_id>(.*?)<\/agent_id>/s.exec(toolCallBlock);
        const nameMatch = /<name>(.*?)<\/name>/s.exec(toolCallBlock);
        const parametersMatch = /<parameters>([\s\S]*?)<\/parameters>/s.exec(toolCallBlock);

        if (instructionsMatch && callIdMatch && nameMatch && parametersMatch) {
            try {
                const parameters = JSON.parse(parametersMatch[1].trim());

                toolCalls.push({
                    instructions: instructionsMatch[1].trim(),
                    call_id: callIdMatch[1].trim(),
                    name: nameMatch[1].trim(),
                    parameters,
                    type: "mfcs_agent"
                });
            } catch (error) {
                console.error('解析参数JSON失败:', error);
            }
        }
    }

    return toolCalls;
}

export const TOOL_RESULT_TAG = '<tool_result>';
export const TOOL_RESULT_END_TAG = '</tool_result>';
export const AGENT_RESULT_TAG = '<agent_result>';
export const AGENT_RESULT_END_TAG = '</agent_result>';