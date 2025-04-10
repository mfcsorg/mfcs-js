import { AiResponseParser } from '../src/index';

/**
 * 示例：如何使用 AiResponseParser 类
 */
function example() {
    // 创建解析器实例
    const parser = new AiResponseParser();

    // 监听 API 调用事件
    parser.on('apiCall', (apiCall) => {
        console.log('收到 API 调用:', apiCall);

        // 模拟 API 调用
        setTimeout(() => {
            // 添加 API 执行结果
            parser.addApiResult(
                apiCall.call_id,
                apiCall.name,
                { success: true, message: `API ${apiCall.name} 执行成功` }
            );
        }, 1000);
    });

    // 监听 API 结果事件
    parser.on('apiResults', (results) => {
        console.log('所有 API 执行结果:', results);
    });

    // 模拟流式数据输入
    const streamData = [
        '这是一些文本，然后有一个 API 调用：',
        '<call_api>',
        '<instructions>获取用户信息</instructions>',
        '<call_id>1</call_id>',
        '<name>getUserInfo</name>',
        '<parameters>',
        '{"userId": "12345"}',
        '</parameters>',
        '</call_api>',
        '这是更多文本，然后有另一个 API 调用：',
        '<call_api>',
        '<instructions>更新用户状态</instructions>',
        '<call_id>2</call_id>',
        '<name>updateUserStatus</name>',
        '<parameters>',
        '{"userId": "12345", "status": "active"}',
        '</parameters>',
        '</call_api>',
        '这是最后一些文本。',
        ''
    ];

    // 模拟流式处理
    let isLast = false;
    for (let i = 0; i < streamData.length; i++) {
        if (i === streamData.length - 1) {
            isLast = true;
        }
        parser.processChunk(streamData[i], isLast);
    }
}

// 运行示例
example(); 