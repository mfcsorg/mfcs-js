import { EventEmitter } from 'events';

/**
 * TOOL call parameters interface
 */
interface ToolCallParameters {
    instructions: string;
    call_id: number;
    name: string;
    parameters: Record<string, any>;
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
    private toolCalls: Map<number, ToolCallParameters> = new Map();
    private toolResults: Map<number, ToolResult> = new Map();
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
                    this.toolCalls.set(toolCall.call_id, toolCall);
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

        return { instructions, call_id, name, parameters };
    }

    /**
     * Add TOOL execution result
     * @param callId TOOL call ID
     * @param name TOOL name
     * @param result Execution result
     */
    public addToolResult(callId: number, name: string, result: any): void {
        this.toolResults.set(callId, { call_id: callId, name, result });

        // If all TOOL calls have results and parsing is complete, trigger results event
        if (this.isComplete && this.toolCalls.size === this.toolResults.size) {
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
        if (this.toolCalls.size !== this.toolResults.size) {
            return;
        }

        let resultText = '<tool_result>\n';

        // Sort results by call_id
        const sortedResults = Array.from(this.toolResults.values())
            .sort((a, b) => a.call_id - b.call_id);

        for (const result of sortedResults) {
            let tmp: string;
            if (typeof result.result !== 'string') {
                tmp = JSON.stringify(result.result);
            } else {
                tmp = result.result;
            }
            resultText += `[call_id: ${result.call_id} name: ${result.name}] ${tmp}\n`;
        }

        resultText += '</tool_result>';

        this.emit('toolResults', resultText);
    }
} 