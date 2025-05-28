import { EventEmitter } from 'events';

/**
 * TOOL call parameters interface
 */
interface ToolCallParameters {
    instructions: string;
    call_id: number;
    name: string;
    parameters: Record<string, any>;
    type: string;
}

/**
 * TOOL execution result interface
 */
interface ToolResult {
    call_id: number;
    name: string;
    result: any;
}

/**
 * AI Response Parser class
 * Used to parse streaming AI responses, handle TOOL calls and results
 */
export class AiResponseParser extends EventEmitter {
    private buffer: string = '';
    private toolCalls: Map<string, ToolCallParameters> = new Map();
    private toolResults: string[] = [];
    private isComplete: boolean = false;
    private callIdCounter: number = 0;

    constructor() {
        super();
    }

    /**
     * Process streaming AI response data
     * @param chunk Data chunk
     * @param isLast Whether this is the last chunk
     */
    public processChunk(chunk: string, isLast: boolean = false): void {
        if (chunk != null && chunk != undefined && chunk != '') {
            this.buffer += chunk;

            // Try to parse complete tool_call blocks
            this.parseToolCallBlocks();
            this.parseAgentCallBlocks();
        }

        // If this is the last chunk, mark as complete and trigger results event
        if (isLast) {
            this.isComplete = true;
            this.emitToolResults();
        }
    }

    /**
     * Parse tool_call blocks from buffer
     */
    private parseToolCallBlocks(): void {
        const toolCallRegex = /<mfcs_tool>([\s\S]*?)<\/mfcs_tool>/g;
        let match;

        while ((match = toolCallRegex.exec(this.buffer)) !== null) {
            const toolCallBlock = match[0];
            const toolCallContent = match[1];

            try {
                const toolCall = this.parseCallToolContent(toolCallContent);
                if (toolCall) {
                    this.toolCalls.set("mfcs_tool_" + toolCall.call_id, toolCall);
                    this.emit('toolCall', toolCall);
                }
            } catch (error) {
                console.error('Failed to parse tool_call block:', error);
            }

            // Remove processed block from buffer
            this.buffer = this.buffer.replace(toolCallBlock, '');
        }
    }

    /**
     * Parse tool_call blocks from buffer
     */
    private parseAgentCallBlocks(): void {
        const toolCallRegex = /<mfcs_agent>([\s\S]*?)<\/mfcs_agent>/g;
        let match;

        while ((match = toolCallRegex.exec(this.buffer)) !== null) {
            const toolCallBlock = match[0];
            const toolCallContent = match[1];

            try {
                const toolCall = this.parseCallAgentContent(toolCallContent);
                if (toolCall) {
                    this.toolCalls.set("mfcs_agent_" + toolCall.call_id, toolCall);
                    this.emit('toolCall', toolCall);
                }
            } catch (error) {
                console.error('Failed to parse tool_call block:', error);
            }

            // Remove processed block from buffer
            this.buffer = this.buffer.replace(toolCallBlock, '');
        }
    }

    /**
     * Parse tool_call content
     * @param content Content inside tool_call tags
     * @returns Parsed TOOL call parameters
     */
    private parseCallToolContent(content: string): ToolCallParameters | null {
        const instructionsMatch = /<instructions>([\s\S]*?)<\/instructions>/i.exec(content);
        const callIdMatch = /<call_id>([\s\S]*?)<\/call_id>/i.exec(content);
        const nameMatch = /<name>([\s\S]*?)<\/name>/i.exec(content);
        const parametersMatch = /<parameters>([\s\S]*?)<\/parameters>/i.exec(content);

        if (!instructionsMatch || !callIdMatch || !nameMatch || !parametersMatch) {
            return null;
        }

        const instructions = instructionsMatch[1].trim();
        const call_id = parseInt(callIdMatch[1].trim(), 10);
        const name = nameMatch[1].trim();

        let parameters: Record<string, any>;
        try {
            parameters = JSON.parse(parametersMatch[1].trim());
        } catch (error) {
            console.error('Failed to parse parameters JSON:', error);
            return null;
        }

        return { instructions, call_id, name, parameters, type: 'mfcs_tool' };
    }

    /**
     * Parse mfcs_agent content
     * @param content Content inside mfcs_agent tags
     * @returns Parsed TOOL call parameters
     */
    private parseCallAgentContent(content: string): ToolCallParameters | null {
        const instructionsMatch = /<instructions>([\s\S]*?)<\/instructions>/i.exec(content);
        const callIdMatch = /<agent_id>([\s\S]*?)<\/agent_id>/i.exec(content);
        const nameMatch = /<name>([\s\S]*?)<\/name>/i.exec(content);
        const parametersMatch = /<parameters>([\s\S]*?)<\/parameters>/i.exec(content);

        if (!instructionsMatch || !callIdMatch || !nameMatch || !parametersMatch) {
            return null;
        }

        const instructions = instructionsMatch[1].trim();
        const call_id = parseInt(callIdMatch[1].trim(), 10);
        const name = nameMatch[1].trim();

        let parameters: Record<string, any>;
        try {
            parameters = JSON.parse(parametersMatch[1].trim());
        } catch (error) {
            console.error('Failed to parse parameters JSON:', error);
            return null;
        }

        return { instructions, call_id, name, parameters, type: 'mfcs_agent' };
    }

    /**
     * Add TOOL execution result
     * @param callId TOOL call ID
     * @param name TOOL name
     * @param result Execution result
     * @param type TOOL type: mfcs_tool or mfcs_agent
     */
    public addToolResult(callId: number, name: string, result: any, type: string): void {
        if (type == "mfcs_agent") {
            this.toolResults.push(`<agent_result>\n[agent_id: ${callId} name: ${name}] ${result}\n</agent_result>`);
        } else {
            this.toolResults.push(`<tool_result>\n[call_id: ${callId} name: ${name}] ${result}\n</tool_result>`);
        }

        // If all TOOL calls have results and parsing is complete, trigger results event
        if (this.isComplete && this.toolCalls.size === this.toolResults.length) {
            this.emitToolResults();
        }
    }

    /**
     * Emit TOOL results event
     */
    private emitToolResults(): void {
        if (this.toolCalls.size === 0) {
            this.emit('toolResults', null);
            return;
        }
        if (this.toolCalls.size !== this.toolResults.length) {
            return;
        }

        let resultText = this.toolResults.join('\n');

        this.emit('toolResults', resultText);
    }
}