#!/usr/bin/env node

/**
 * ChatAgent测试脚本
 * 用于测试ChatAgent的API接口和功能
 */

const fetch = require('node-fetch')

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000'
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'https://api.flizaos.com'

async function testChatAPI() {
  console.log('🧪 测试ChatAgent API接口...\n')

  try {
    // 测试对话接口
    console.log('1. 测试基础对话功能')
    const chatResponse = await fetch(`${BASE_URL}/api/agent/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: '你好，请介绍一下自己',
        sessionId: 'test-session-001',
        agentName: 'AI助手',
        personality: 'helpful',
        language: 'zh-CN'
      })
    })

    if (chatResponse.ok) {
      const chatData = await chatResponse.json()
      console.log('✅ 对话接口测试成功')
      console.log('回复:', chatData.reply)
      console.log('会话ID:', chatData.sessionId)
    } else {
      console.log('❌ 对话接口测试失败:', chatResponse.status)
    }

    console.log('\n2. 测试Twitter用户扮演功能')
    const twitterResponse = await fetch(`${BASE_URL}/api/agent/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'What are you working on lately?',
        sessionId: 'test-session-002',
        agentName: 'Elon Musk',
        twitterUsername: 'elonmusk',
        personality: 'creative',
        language: 'en-US'
      })
    })

    if (twitterResponse.ok) {
      const twitterData = await twitterResponse.json()
      console.log('✅ Twitter扮演测试成功')
      console.log('扮演用户:', twitterData.twitterUser || '通用AI')
      console.log('回复:', twitterData.reply)
    } else {
      console.log('❌ Twitter扮演测试失败:', twitterResponse.status)
    }

    console.log('\n2.1 测试中文Twitter用户扮演')
    const chineseTwitterResponse = await fetch(`${BASE_URL}/api/agent/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: '你好，请介绍一下你自己',
        sessionId: 'test-session-003',
        agentName: '马斯克',
        twitterUsername: 'elonmusk',
        personality: 'creative',
        language: 'zh-CN'
      })
    })

    if (chineseTwitterResponse.ok) {
      const chineseData = await chineseTwitterResponse.json()
      console.log('✅ 中文Twitter扮演测试成功')
      console.log('扮演用户:', chineseData.twitterUser || '通用AI')
      console.log('回复:', chineseData.reply)
    } else {
      console.log('❌ 中文Twitter扮演测试失败:', chineseTwitterResponse.status)
    }

    console.log('\n3. 测试模型列表接口')
    const modelsResponse = await fetch(`${BASE_URL}/api/agent/models`)

    if (modelsResponse.ok) {
      const modelsData = await modelsResponse.json()
      console.log('✅ 模型列表接口测试成功')
      console.log('可用模型:', modelsData.models.length, '个')
      modelsData.models.forEach(model => {
        console.log(`  - ${model.name}: ${model.description}`)
      })
    } else {
      console.log('❌ 模型列表接口测试失败:', modelsResponse.status)
    }

    console.log('\n4. 测试配置管理接口')
    const configResponse = await fetch(`${BASE_URL}/api/agent/config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agentId: 'test-agent-001',
        config: {
          personality: 'friendly',
          language: 'zh-CN',
          customSettings: {
            responseDelay: 1000,
            maxTokens: 150
          }
        }
      })
    })

    if (configResponse.ok) {
      const configData = await configResponse.json()
      console.log('✅ 配置管理接口测试成功')
      console.log('配置已更新:', configData.agentId)
    } else {
      console.log('❌ 配置管理接口测试失败:', configResponse.status)
    }

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message)
  }
}

async function testExternalAIService() {
  console.log('\n🔗 测试外部AI服务连接...\n')

  try {
    // 测试main_farm2.py服务连接
    console.log('1. 测试服务状态')
    const statusResponse = await fetch(`${AI_SERVICE_URL}/check_alive`)

    if (statusResponse.ok) {
      const statusData = await statusResponse.json()
      console.log('✅ 外部AI服务连接成功')
      console.log('服务状态:', statusData.status)
    } else {
      console.log('❌ 外部AI服务连接失败:', statusResponse.status)
    }

    console.log('\n2. 测试用户信息获取')
    const userInfoResponse = await fetch(`${AI_SERVICE_URL}/get_user_info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'elonmusk'
      })
    })

    if (userInfoResponse.ok) {
      const userInfoData = await userInfoResponse.json()
      console.log('✅ 用户信息获取成功')
      console.log('用户名:', userInfoData.username)
    } else {
      console.log('❌ 用户信息获取失败:', userInfoResponse.status)
    }

    console.log('\n3. 测试推文获取')
    const tweetsResponse = await fetch(`${AI_SERVICE_URL}/get_user_tweets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'elonmusk',
        limit: 5
      })
    })

    if (tweetsResponse.ok) {
      const tweetsData = await tweetsResponse.json()
      console.log('✅ 推文获取成功')
      console.log('推文数量:', tweetsData.count)
    } else {
      console.log('❌ 推文获取失败:', tweetsResponse.status)
    }

  } catch (error) {
    console.error('❌ 外部服务测试中发生错误:', error.message)
  }
}

async function testWebSocketConnection() {
  console.log('\n🔌 测试WebSocket连接...\n')

  try {
    const WebSocket = require('ws')
    const wsUrl = `${BASE_URL.replace('http', 'ws')}/ws/agent?agentName=测试助手&personality=helpful&language=zh-CN`

    const ws = new WebSocket(wsUrl)

    ws.on('open', () => {
      console.log('✅ WebSocket连接成功')

      // 发送测试消息
      ws.send(JSON.stringify({
        type: 'chat',
        content: '你好，这是一个测试消息'
      }))
    })

    ws.on('message', (data) => {
      const message = JSON.parse(data.toString())
      console.log('📨 收到回复:', message.content)
      ws.close()
    })

    ws.on('error', (error) => {
      console.log('❌ WebSocket连接失败:', error.message)
    })

    ws.on('close', () => {
      console.log('🔌 WebSocket连接已关闭')
    })

    // 等待5秒后关闭连接
    setTimeout(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
    }, 5000)

  } catch (error) {
    console.error('❌ WebSocket测试中发生错误:', error.message)
  }
}

async function runAllTests() {
  console.log('🚀 开始ChatAgent功能测试\n')
  console.log('测试目标:', BASE_URL)
  console.log('AI服务:', AI_SERVICE_URL)
  console.log('=' * 50)

  await testChatAPI()
  await testExternalAIService()
  await testWebSocketConnection()

  console.log('\n✨ 测试完成！')
}

// 运行测试
if (require.main === module) {
  runAllTests().catch(console.error)
}

module.exports = {
  testChatAPI,
  testExternalAIService,
  testWebSocketConnection,
  runAllTests
}
