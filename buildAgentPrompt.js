const fs = require('fs');
const path = require('path');

function readAgentPrompt() {
  const promptPath = path.join(__dirname, 'mfcs-prompt', 'AgentPrompt.txt');
  return fs.readFileSync(promptPath, 'utf8');
}

const agentPromptContent = readAgentPrompt();

// 读取模板内容
const templateContent = `/**
 * Get agent prompt
 * @param packet Agent package [{description: string, agent_api_list: [{name: string, description: string, parameters: string}]}]
 * @returns Agent prompt
 */
export function getAgentPrompt(packet: any): string {
  let prompt = \`
${agentPromptContent}
<agent_api_list>
\${JSON.stringify(packet)}
</agent_api_list>
    \`
  return prompt
}
`;

// 写入到 AgentPrompt.ts 文件
const targetPath = path.join(__dirname, 'src', 'AgentPrompt.ts');
fs.writeFileSync(targetPath, templateContent, 'utf8');
