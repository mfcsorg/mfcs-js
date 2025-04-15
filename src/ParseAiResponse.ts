/**
 * 解析AI响应中的call_api部分
 * @param response AI响应文本
 * @returns 解析后的API调用数组
 */
export interface ApiCall {
    instructions: string;
    call_id: string;
    name: string;
    parameters: Record<string, any>;
}

export function parseAiResponse(response: string): ApiCall[] {
    const apiCalls: ApiCall[] = [];

    // 使用正则表达式匹配所有call_api块
    const callApiRegex = /<mfcs_call>([\s\S]*?)<\/mfcs_call>/g;
    let match;

    while ((match = callApiRegex.exec(response)) !== null) {
        const callApiBlock = match[1];

        // 解析各个字段
        const instructionsMatch = /<instructions>(.*?)<\/instructions>/s.exec(callApiBlock);
        const callIdMatch = /<call_id>(.*?)<\/call_id>/s.exec(callApiBlock);
        const nameMatch = /<name>(.*?)<\/name>/s.exec(callApiBlock);
        const parametersMatch = /<parameters>([\s\S]*?)<\/parameters>/s.exec(callApiBlock);

        if (instructionsMatch && callIdMatch && nameMatch && parametersMatch) {
            try {
                const parameters = JSON.parse(parametersMatch[1].trim());

                apiCalls.push({
                    instructions: instructionsMatch[1].trim(),
                    call_id: callIdMatch[1].trim(),
                    name: nameMatch[1].trim(),
                    parameters
                });
            } catch (error) {
                console.error('解析参数JSON失败:', error);
            }
        }
    }

    return apiCalls;
}

export const API_RESULT_TAG = '<mfcs_result>';
export const API_RESULT_END_TAG = '</mfcs_result>';