import { AiResponseParser } from '../src/index';

/**
 * Example: How to use the AiResponseParser class
 */
function example() {
    // Create parser instance
    const parser = new AiResponseParser();

    // Listen for TOOL call events
    parser.on('toolCall', (toolCall) => {
        console.log('Received TOOL call:', toolCall);

        // Simulate TOOL call
        setTimeout(() => {
            // Add TOOL execution result
            parser.addToolResult(
                toolCall.call_id,
                toolCall.name,
                { success: true, message: `TOOL ${toolCall.name} executed successfully` }
            );
        }, 1000);
    });

    // Listen for TOOL results events
    parser.on('toolResults', (results) => {
        if (results) {
            console.log('All TOOL execution results:', results);
        } else {
            console.log('No TOOL execution');
        }
    });

    // Simulate streaming data input
    const streamData = [
        'This is some text, then there is an TOOL call:',
        '<mfcs_tool>',
        '<instructions>Get user information</instructions>',
        '<call_id>1</call_id>',
        '<name>getUserInfo</name>',
        '<parameters>',
        '{"userId": "12345"}',
        '</parameters>',
        '</mfcs_tool>',
        'This is more text, then there is another TOOL call:',
        '<mfcs_tool>',
        '<instructions>Update user status</instructions>',
        '<call_id>2</call_id>',
        '<name>updateUserStatus</name>',
        '<parameters>',
        '{"userId": "12345", "status": "active"}',
        '</parameters>',
        '</mfcs_tool>',
        `<mfcs_tool>
        <instructions>Get user information</instructions>
        <call_id>3</call_id>
        <name>getUserInfo</name>
        <parameters>
        {"userId": "12345"}
        </parameters>
        </mfcs_tool>
        This is more text, then there is another TOOL call:
        <mfcs_tool>
        <instructions>Update user status</instructions>
        <call_id>4</call_id>
        <name>updateUserStatus</name>
        <parameters>
        {"userId": "12345", "status": "active"}
        </parameters>
        </mfcs_tool>`,
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