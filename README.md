# MFCS

Model Function Calling Standard

## 安装

```bash
npm install mfcs-js
```

## 功能

### AI 响应解析器 (AiResponseParser)

`AiResponseParser` 类用于解析流式 AI 响应，处理 API 调用和结果。它能够从流式数据中提取 API 调用信息，并通过事件机制通知外部系统执行相应的 API 调用，然后将结果返回给 AI。

#### 主要功能

1. **解析流式 AI 响应**：处理一小段一小段输入的流式数据，解析出完整的 API 调用信息。
2. **事件通知**：当解析到完整的 API 调用时，通过事件通知外部系统执行相应的 API 调用。
3. **结果收集**：收集所有 API 调用的执行结果，并在所有 API 调用完成后，通过事件返回格式化的结果。

#### 使用方法

```typescript
import { AiResponseParser } from 'mfcs';

// 创建解析器实例
const parser = new AiResponseParser();

// 监听 API 调用事件
parser.on('apiCall', (apiCall) => {
  console.log('收到 API 调用:', apiCall);
  
  // 执行 API 调用
  // ...
  
  // 添加 API 执行结果
  parser.addApiResult(
    apiCall.call_id,
    apiCall.name,
    { success: true, message: 'API 执行成功' }
  );
});

// 监听 API 结果事件
parser.on('apiResults', (results) => {
  console.log('所有 API 执行结果:', results);
});

// 处理流式数据
parser.processChunk('一些文本', false);
parser.processChunk('<call_api><instructions>xxx</instructions><call_id>1</call_id><name>apiName</name><parameters>{"param": "value"}</parameters></call_api>', false);
parser.processChunk('更多文本', true); // 最后一块数据
```

#### 事件

- `apiCall`：当解析到完整的 API 调用时触发，参数为 API 调用信息。
- `apiResults`：当所有 API 调用都有结果且解析已完成时触发，参数为格式化的结果文本。

#### 方法

- `processChunk(chunk: string, isLast: boolean = false)`：处理流式数据块。
- `addApiResult(callId: number, name: string, result: Record<string, any>)`：添加 API 执行结果。
- `getToolResultPrompt()`：获取工具执行结果提示词。

### 工具提示生成器

`getToolPrompt` 函数用于生成工具提示，包含 API 列表和调用规则。

```typescript
import { getToolPrompt } from 'mfcs';

const packet = {
  'user': {
    description: '用户相关 API',
    api_list: [
      {
        name: 'getUserInfo',
        description: '获取用户信息',
        parameters: '{"userId": "string"}'
      }
    ]
  }
};

const prompt = getToolPrompt(packet);
console.log(prompt);
```

## 示例

运行示例：

```bash
npm run example
```

## 许可证

Apache-2.0
