import { AiResponseParser } from '../src/index';

/**
 * Example: How to use the AiResponseParser class
 */
function example() {
    // Create parser instance
    const parser = new AiResponseParser();

    // Listen for API call events
    parser.on('apiCall', (apiCall) => {
        console.log('Received API call:', apiCall);

        // Simulate API call
        setTimeout(() => {
            // Add API execution result
            parser.addApiResult(
                apiCall.call_id,
                apiCall.name,
                { success: true, message: `API ${apiCall.name} executed successfully` }
            );
        }, 1000);
    });

    // Listen for API results events
    parser.on('apiResults', (results) => {
        console.log('All API execution results:', results);
    });

    // Simulate streaming data input
    const streamData = [
        'This is some text, then there is an API call:',
        '<call_api>',
        '<instructions>Get user information</instructions>',
        '<call_id>1</call_id>',
        '<name>getUserInfo</name>',
        '<parameters>',
        '{"userId": "12345"}',
        '</parameters>',
        '</call_api>',
        'This is more text, then there is another API call:',
        '<call_api>',
        '<instructions>Update user status</instructions>',
        '<call_id>2</call_id>',
        '<name>updateUserStatus</name>',
        '<parameters>',
        '{"userId": "12345", "status": "active"}',
        '</parameters>',
        '</call_api>',
        'This is the last text.',
        ''
    ];

    // Simulate streaming processing
    let isLast = false;
    for (let i = 0; i < streamData.length; i++) {
        if (i === streamData.length - 1) {
            isLast = true;
        }
        parser.processChunk(streamData[i], isLast);
    }
}

// Run example
example(); 