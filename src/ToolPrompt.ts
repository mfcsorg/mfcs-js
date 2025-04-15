import * as fs from 'fs';
import * as path from 'path';

// 读取工具提示文本
const toolPromptText = fs.readFileSync(
  path.join(__dirname, 'mfcs-prompt', 'ToolPrompt.txt'),
  'utf-8'
);

/**
 * Get tool prompt
 * @param packet Tool package [{description: string, api_list: [{name: string, description: string, parameters: string}]}]
 * @returns Tool prompt
 */
export function getToolPrompt(packet: any): string {
  let prompt = `
${toolPromptText}
<api_list>
${JSON.stringify(packet)}
</api_list>
    `
  return prompt
}
