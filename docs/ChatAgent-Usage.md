# ChatAgent 使用指南

## 概述

ChatAgent是一个可配置的AI对话助手系统，集成到mu-world虚拟世界框架中。它支持多种AI模型、个性化配置和Twitter用户模拟功能。

## 功能特性

### 🤖 AI对话功能
- 支持多种个性类型（友善、创意、分析、专业、友好）
- 多语言支持（中文、英文、日文）
- 实时对话响应
- 消息历史记录

### 🎭 Twitter用户扮演 (核心功能)
- **完全基于真实Twitter用户数据**进行AI扮演
- 自动获取用户最近50条推文作为个性基础
- AI将模拟该用户的语言风格、个性和知识背景
- 支持任何公开的Twitter用户名
- **这是与main_farm2.py服务的核心集成功能**

### 🎨 可视化界面
- 3D头像显示（可配置模型）
- 自定义UI界面
- 可调节的颜色和缩放
- 响应式聊天界面

### ⚙️ 灵活配置
- 可替换AI模型
- 自定义问候消息
- 调节界面大小和外观
- 行为参数配置

## 安装和使用

### 1. 基础设置

确保你的mu-world服务器正在运行，并且已经配置了外部AI服务连接。

在环境变量中设置：
```bash
AI_SERVICE_URL=https://api.flizaos.com
```

### 2. 创建ChatAgent

在mu-world编辑器中：

1. 打开应用库
2. 选择"AI对话助手"应用
3. 拖拽到世界中的任意位置
4. 配置参数（见下方配置说明）

### 3. 配置参数

#### 基础设置
- **Agent名称**: 设置AI助手的显示名称
- **Twitter用户名**: **核心参数** - 填写要扮演的Twitter用户名（如：elonmusk, naval, etc.）
- **启用Twitter扮演**: 开启后将连接main_farm2.py服务进行真实用户扮演
- **个性类型**: 选择AI的回复风格（在Twitter扮演模式下作为辅助参数）
- **语言**: 选择对话语言

#### 外观设置
- **AI回复颜色**: AI消息的文本颜色
- **用户消息颜色**: 用户消息的文本颜色
- **对话框背景色**: 聊天界面背景颜色
- **UI缩放**: 调整界面大小
- **头像缩放**: 调整3D头像大小

#### 行为设置
- **自动问候**: 是否自动发送问候消息
- **问候消息**: 自定义问候内容
- **最大消息数**: 界面显示的消息数量限制
- **显示头像**: 是否显示3D头像

## API接口

### 对话接口
```
POST /api/agent/chat
```

请求体：
```json
{
  "message": "用户消息",
  "sessionId": "会话ID",
  "agentName": "Agent名称",
  "personality": "个性类型",
  "language": "语言代码"
}
```

响应：
```json
{
  "success": true,
  "reply": "AI回复",
  "sessionId": "会话ID",
  "timestamp": "时间戳"
}
```

### 模型列表接口
```
GET /api/agent/models
```

### 配置管理接口
```
POST /api/agent/config
```

### WebSocket接口
```
WS /ws/agent?agentName=名称&personality=个性&language=语言
```

## 集成外部AI服务

### 连接到main_farm2.py

ChatAgent可以连接到你的main_farm2.py服务来获取Twitter数据和AI对话功能：

1. **用户信息获取**: 调用`/get_user_info`接口获取Twitter用户数据
2. **推文获取**: 调用`/get_user_tweets`接口获取用户推文
3. **AI对话**: 可以扩展连接到WebSocket对话服务

### 自定义AI模型

要替换AI模型，你可以：

1. **修改API端点**: 在配置中更改`apiEndpoint`
2. **自定义回复逻辑**: 修改`generatePersonalizedReply`函数
3. **添加新的个性类型**: 扩展personality选项
4. **集成其他AI服务**: 修改API调用逻辑

## 示例配置

### 基础AI助手
```json
{
  "agentName": "小助手",
  "personality": "helpful",
  "language": "zh-CN",
  "autoGreeting": true,
  "greetingMessage": "你好！我是小助手，有什么可以帮助你的吗？"
}
```

### Twitter用户扮演 (推荐使用)
```json
{
  "agentName": "Elon Musk",
  "twitterUsername": "elonmusk",
  "enableTwitterPersona": true,
  "personality": "creative",
  "language": "en-US"
}
```

### 中文Twitter用户扮演
```json
{
  "agentName": "马斯克",
  "twitterUsername": "elonmusk",
  "enableTwitterPersona": true,
  "personality": "creative",
  "language": "zh-CN"
}
```

### 专业顾问
```json
{
  "agentName": "专业顾问",
  "personality": "professional",
  "language": "zh-CN",
  "responseColor": "#0066cc",
  "greetingMessage": "您好，我是专业顾问，很高兴为您提供咨询服务。"
}
```

## 故障排除

### 常见问题

1. **AI不回复**: 检查API服务连接和网络状态
2. **界面显示异常**: 调整UI缩放参数
3. **Twitter数据获取失败**: 确认用户名正确且服务可用
4. **消息不显示**: 检查颜色设置和对比度

### 调试方法

1. 查看浏览器控制台日志
2. 检查服务器API响应
3. 验证配置参数格式
4. 测试网络连接

## 扩展开发

### 添加新功能

1. **语音对话**: 集成语音识别和合成
2. **情感分析**: 分析用户情绪并调整回复
3. **多模态交互**: 支持图片、视频等媒体
4. **学习能力**: 记住用户偏好和历史

### 自定义节点

你可以基于ChatAgent创建自定义节点类型：

```javascript
export class CustomChatAgent extends ChatAgent {
  constructor(data) {
    super(data)
    // 添加自定义功能
  }
  
  async customFunction() {
    // 实现自定义逻辑
  }
}
```

## 许可证

本项目遵循MIT许可证。
