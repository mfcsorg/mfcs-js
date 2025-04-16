import { getToolPrompt } from '../src/index';

/**
 * Example: How to use the getToolPrompt function
 */
function example() {
    // Prepare TOOL package data
    const toolPacket = [
        {
            description: 'User-related TOOLs',
            tool_list: [
                {
                    "name": "getUserInfo",
                    "description": "Get user information",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "userId": {
                                "type": "string",
                                "description": "User ID",
                            },
                        },
                        "required": ["userId"],
                    },
                    "returns": {
                        "type": "object",
                        "description": "User information",
                    },
                },
                {
                    "name": "updateUserStatus",
                    "description": "Update user status",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "userId": {
                                "type": "string",
                                "description": "User ID",
                            },
                            "status": {
                                "type": "string",
                                "description": "User status",
                            },
                        },
                        "required": ["userId", "status"],
                    },
                    "returns": {
                        "type": "boolean",
                        "description": "Whether the update was successful",
                    },
                }
            ]
        },
        {
            description: 'Product-related TOOLs',
            tool_list: [
                {
                    "name": "getProductList",
                    "description": "Get product list",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "page": {
                                "type": "number",
                                "description": "Page number",
                            },
                            "limit": {
                                "type": "number",
                                "description": "Items per page",
                            },
                        },
                        "required": ["page", "limit"],
                    },
                    "returns": {
                        "type": "array",
                        "description": "Product list",
                    },
                }
            ]
        }
    ];

    // Generate tool prompt
    const toolPrompt = getToolPrompt(toolPacket);

    // Output tool prompt
    console.log('Generated tool prompt:');
    console.log('----------------------------------------');
    console.log(toolPrompt);
    console.log('----------------------------------------');
}

// Run example
example(); 