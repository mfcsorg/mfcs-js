import { EventEmitter } from 'events';

/**
 * API 调用参数接口
 */
interface ApiCallParameters {
    instructions: string;
    call_id: number;
    name: string;
    parameters: Record<string, any>;
}

/**
 * API 执行结果接口
 */
interface ApiResult {
    call_id: number;
    name: string;
    result: Record<string, any>;
}

/**
 * AI 响应解析器类
 * 用于解析流式 AI 响应，处理 API 调用和结果
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
     * 处理流式 AI 响应数据
     * @param chunk 数据块
     * @param isLast 是否为最后一块数据
     */
    public processChunk(chunk: string, isLast: boolean = false): void {
        if (chunk != null && chunk != undefined && chunk != '') {
            this.buffer += chunk;

            // 尝试解析完整的 call_api 块
            this.parseCallApiBlocks();
        }

        // 如果是最后一块数据，标记为完成并触发结果事件
        if (isLast) {
            this.isComplete = true;
            this.emitApiResults();
        }
    }

    /**
     * 解析缓冲区中的 call_api 块
     */
    private parseCallApiBlocks(): void {
        const callApiRegex = /<call_api>([\s\S]*?)<\/call_api>/g;
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
                console.error('解析 call_api 块失败:', error);
            }

            // 从缓冲区中移除已处理的块
            this.buffer = this.buffer.replace(callApiBlock, '');
        }
    }

    /**
     * 解析 call_api 内容
     * @param content call_api 标签内的内容
     * @returns 解析后的 API 调用参数
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
            console.error('解析参数 JSON 失败:', error);
            return null;
        }

        return { instructions, call_id, name, parameters };
    }

    /**
     * 添加 API 执行结果
     * @param callId API 调用 ID
     * @param name API 名称
     * @param result 执行结果
     */
    public addApiResult(callId: number, name: string, result: Record<string, any>): void {
        this.apiResults.set(callId, { call_id: callId, name, result });

        // 如果所有 API 调用都有结果且解析已完成，触发结果事件
        if (this.isComplete && this.apiCalls.size === this.apiResults.size) {
            this.emitApiResults();
        }
    }

    /**
     * 触发 API 结果事件
     */
    private emitApiResults(): void {
        if (this.apiCalls.size === 0 || this.apiCalls.size !== this.apiResults.size) {
            return;
        }

        let resultText = '<api_result>\n';

        // 按 call_id 排序结果
        const sortedResults = Array.from(this.apiResults.values())
            .sort((a, b) => a.call_id - b.call_id);

        for (const result of sortedResults) {
            resultText += `[call_id: ${result.call_id} name: ${result.name}] ${JSON.stringify(result.result)}\n`;
        }

        resultText += '</api_result>';

        this.emit('apiResults', resultText);
    }
} 