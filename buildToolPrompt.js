const fs = require('fs');
const path = require('path');

function readToolPrompt() {
  const promptPath = path.join(__dirname, 'mfcs-prompt', 'ToolPrompt.txt');
  return fs.readFileSync(promptPath, 'utf8');
}

const toolPromptContent = readToolPrompt();

// 读取模板内容
const templateContent = `/**
 * Get tool prompt
 * @param packet Tool package [{description: string, tool_list: [{name: string, description: string, parameters: string}]}]
 * @returns Tool prompt
 */
export function getToolPrompt(packet: any): string {
  let prompt = \`
${toolPromptContent}
<tool_list>
\${JSON.stringify(packet)}
</tool_list>
    \`
  return prompt
}
`;

// 写入到 ToolPrompt.ts 文件
const targetPath = path.join(__dirname, 'src', 'ToolPrompt.ts');
fs.writeFileSync(targetPath, templateContent, 'utf8');
