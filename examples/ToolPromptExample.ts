import { getToolPrompt } from '../src/index';

/**
 * 示例：如何使用 getToolPrompt 函数
 */
function example() {
    // 准备API包数据
    const apiPacket = [
        {
            description: '用户相关API',
            api_list: [
                {
                    "name": "getUserInfo",
                    "description": "获取用户信息",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "userId": {
                                "type": "string",
                                "description": "用户ID",
                            },
                        },
                        "required": ["userId"],
                    },
                    "returns": {
                        "type": "object",
                        "description": "用户信息",
                    },
                },
                {
                    "name": "updateUserStatus",
                    "description": "更新用户状态",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "userId": {
                                "type": "string",
                                "description": "用户ID",
                            },
                            "status": {
                                "type": "string",
                                "description": "用户状态",
                            },
                        },
                        "required": ["userId", "status"],
                    },
                    "returns": {
                        "type": "boolean",
                        "description": "更新是否成功",
                    },
                }
            ]
        },
        {
            description: '产品相关API',
            api_list: [
                {
                    "name": "getProductList",
                    "description": "获取产品列表",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "page": {
                                "type": "number",
                                "description": "页码",
                            },
                            "limit": {
                                "type": "number",
                                "description": "每页数量",
                            },
                        },
                        "required": ["page", "limit"],
                    },
                    "returns": {
                        "type": "array",
                        "description": "产品列表",
                    },
                }
            ]
        }
    ];

    // 生成工具提示
    const toolPrompt = getToolPrompt(apiPacket);

    // 输出工具提示
    console.log('生成的工具提示:');
    console.log('----------------------------------------');
    console.log(toolPrompt);
    console.log('----------------------------------------');
}

// 运行示例
example(); 