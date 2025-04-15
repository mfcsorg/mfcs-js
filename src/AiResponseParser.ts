import { EventEmitter } from 'events';

/**
 * API call parameters interface
 */
interface ApiCallParameters {
    instructions: string;
    call_id: number;
    name: string;
    parameters: Record<string, any>;
}

/**
 * API execution result interface
 */
interface ApiResult {
    call_id: number;
    name: string;
    result: any;
}

/**
 * AI Response Parser class
 * Used to parse streaming AI responses, handle API calls and results
 */
export class AiResponseParser extends EventEmitter {
    private buffer: string = '';
    private apiCalls: Map<number, ApiCallParameters> = new Map();
    private apiResults: Map<number, ApiResult> = new Map();
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

            // Try to parse complete mfcs_call blocks
            this.parseCallApiBlocks();
        }

        // If this is the last chunk, mark as complete and trigger results event
        if (isLast) {
            this.isComplete = true;
            this.emitApiResults();
        }
    }

    /**
     * Parse mfcs_call blocks from buffer
     */
    private parseCallApiBlocks(): void {
        const callApiRegex = /<mfcs_call>([\s\S]*?)<\/mfcs_call>/g;
        let match;

        while ((match = callApiRegex.exec(this.buffer)) !== null) {
            const callApiBlock = match[0];
            const callApiContent = match[1];

            try {
                const apiCall = this.parseCallApiContent(callApiContent);
                if (apiCall) {
                    this.apiCalls.set(apiCall.call_id, apiCall);
                    this.emit('apiCall', apiCall);
                }
            } catch (error) {
                console.error('Failed to parse mfcs_call block:', error);
            }

            // Remove processed block from buffer
            this.buffer = this.buffer.replace(callApiBlock, '');
        }
    }

    /**
     * Parse mfcs_call content
     * @param content Content inside mfcs_call tags
     * @returns Parsed API call parameters
     */
    private parseCallApiContent(content: string): ApiCallParameters | null {
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
     * Add API execution result
     * @param callId API call ID
     * @param name API name
     * @param result Execution result
     */
    public addApiResult(callId: number, name: string, result: any): void {
        this.apiResults.set(callId, { call_id: callId, name, result });

        // If all API calls have results and parsing is complete, trigger results event
        if (this.isComplete && this.apiCalls.size === this.apiResults.size) {
            this.emitApiResults();
        }
    }

    /**
     * Emit API results event
     */
    private emitApiResults(): void {
        if (this.apiCalls.size === 0) {
            this.emit('apiResults', null);
            return;
        }
        if (this.apiCalls.size !== this.apiResults.size) {
            return;
        }

        let resultText = '<mfcs_result>\n';

        // Sort results by call_id
        const sortedResults = Array.from(this.apiResults.values())
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

        resultText += '</mfcs_result>';

        this.emit('apiResults', resultText);
    }
} 