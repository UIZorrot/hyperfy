import 'ses'
import '../core/lockdown'
import './bootstrap'

import fs from 'fs-extra'
import path from 'path'
import { pipeline } from 'stream/promises'
import Fastify from 'fastify'
import ws from '@fastify/websocket'
import cors from '@fastify/cors'
import compress from '@fastify/compress'
import statics from '@fastify/static'
import multipart from '@fastify/multipart'

import { createServerWorld } from '../core/createServerWorld'
import { hashFile } from '../core/utils-server'
import { getDB } from './db'
import { Storage } from './Storage'
import { initCollections } from './collections'

const rootDir = path.join(__dirname, '../')
const worldDir = path.join(rootDir, process.env.WORLD)
const assetsDir = path.join(worldDir, '/assets')
const collectionsDir = path.join(worldDir, '/collections')
const port = process.env.PORT

// create world folders if needed
await fs.ensureDir(worldDir)
await fs.ensureDir(assetsDir)
await fs.ensureDir(collectionsDir)

// copy over built-in assets and collections
await fs.copy(path.join(rootDir, 'src/world/assets'), path.join(assetsDir))
await fs.copy(path.join(rootDir, 'src/world/collections'), path.join(collectionsDir))

// init collections
const collections = await initCollections({ collectionsDir, assetsDir })

// init db
const db = await getDB(path.join(worldDir, '/db.sqlite'))

// init storage
const storage = new Storage(path.join(worldDir, '/storage.json'))

// create world
const world = createServerWorld()
world.assetsUrl = process.env.PUBLIC_ASSETS_URL
world.collections.deserialize(collections)
world.init({ db, storage, assetsDir })

const fastify = Fastify({ logger: { level: 'error' } })

fastify.register(cors)
fastify.register(compress)
fastify.get('/', async (req, reply) => {
  const title = world.settings.title || 'World'
  const desc = world.settings.desc || ''
  const image = world.resolveURL(world.settings.image?.url) || ''
  const url = process.env.PUBLIC_ASSETS_URL
  const filePath = path.join(__dirname, 'public', 'index.html')
  let html = fs.readFileSync(filePath, 'utf-8')
  html = html.replaceAll('{url}', url)
  html = html.replaceAll('{title}', title)
  html = html.replaceAll('{desc}', desc)
  html = html.replaceAll('{image}', image)
  reply.type('text/html').send(html)
})
fastify.register(statics, {
  root: path.join(__dirname, 'public'),
  prefix: '/',
  decorateReply: false,
  setHeaders: res => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
  },
})
fastify.register(statics, {
  root: assetsDir,
  prefix: '/assets/',
  decorateReply: false,
  setHeaders: res => {
    // all assets are hashed & immutable so we can use aggressive caching
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable') // 1 year
    res.setHeader('Expires', new Date(Date.now() + 31536000000).toUTCString()) // older browsers
  },
})
fastify.register(multipart, {
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
})
fastify.register(ws)
fastify.register(worldNetwork)

const publicEnvs = {}
for (const key in process.env) {
  if (key.startsWith('PUBLIC_')) {
    const value = process.env[key]
    publicEnvs[key] = value
  }
}
const envsCode = `
  if (!globalThis.env) globalThis.env = {}
  globalThis.env = ${JSON.stringify(publicEnvs)}
`
fastify.get('/env.js', async (req, reply) => {
  reply.type('application/javascript').send(envsCode)
})

fastify.post('/api/upload', async (req, reply) => {
  // console.log('DEBUG: slow uploads')
  // await new Promise(resolve => setTimeout(resolve, 2000))
  const file = await req.file()
  const ext = file.filename.split('.').pop().toLowerCase()
  // create temp buffer to store contents
  const chunks = []
  for await (const chunk of file.file) {
    chunks.push(chunk)
  }
  const buffer = Buffer.concat(chunks)
  // hash from buffer
  const hash = await hashFile(buffer)
  const filename = `${hash}.${ext}`
  // save to fs
  const filePath = path.join(assetsDir, filename)
  const exists = await fs.exists(filePath)
  if (!exists) {
    await fs.writeFile(filePath, buffer)
  }
})

fastify.get('/api/upload-check', async (req, reply) => {
  const filename = req.query.filename
  const filePath = path.join(assetsDir, filename)
  const exists = await fs.exists(filePath)
  return { exists }
})

fastify.get('/health', async (request, reply) => {
  try {
    // Basic health check
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    }

    return reply.code(200).send(health)
  } catch (error) {
    console.error('Health check failed:', error)
    return reply.code(503).send({
      status: 'error',
      timestamp: new Date().toISOString(),
    })
  }
})

fastify.get('/status', async (request, reply) => {
  try {
    const status = {
      uptime: Math.round(world.time),
      protected: process.env.ADMIN_CODE !== undefined ? true : false,
      connectedUsers: [],
      commitHash: process.env.COMMIT_HASH,
    }
    for (const socket of world.network.sockets.values()) {
      status.connectedUsers.push({
        id: socket.player.data.userId,
        position: socket.player.position.current.toArray(),
        name: socket.player.data.name,
      })
    }

    return reply.code(200).send(status)
  } catch (error) {
    console.error('Status failed:', error)
    return reply.code(503).send({
      status: 'error',
      timestamp: new Date().toISOString(),
    })
  }
})

// Agent API Routes - 重新设计以正确集成Twitter用户扮演
fastify.post('/api/agent/chat', async (request, reply) => {
  try {
    const { message, sessionId, twitterUsername, agentName, personality, language } = request.body

    if (!message || !sessionId) {
      return reply.code(400).send({
        success: false,
        error: 'Missing required parameters: message, sessionId'
      })
    }

    const aiServiceUrl = process.env.AI_SERVICE_URL || 'https://api.flizaos.com'

    // 如果指定了Twitter用户名，使用main_farm2.py的WebSocket服务
    if (twitterUsername && twitterUsername.trim() !== '') {
      try {
        const aiReply = await chatWithTwitterPersona(twitterUsername, message, sessionId, aiServiceUrl)
        return reply.code(200).send({
          success: true,
          reply: aiReply,
          sessionId: sessionId,
          twitterUser: twitterUsername,
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        console.error('Twitter persona chat failed:', error)
        // 回退到通用AI
      }
    }

    // 使用通用AI回复
    const aiReply = await generateGenericReply(message, personality, language)

    return reply.code(200).send({
      success: true,
      reply: aiReply,
      sessionId: sessionId,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Agent chat API error:', error)
    return reply.code(500).send({
      success: false,
      error: 'Internal server error',
      message: '抱歉，我现在无法回复。请稍后再试。'
    })
  }
})

// 清理重复文本的函数
function cleanDuplicateText(text) {
  if (!text) return text

  // 移除连续重复的字符（如：你你好好 -> 你好）
  text = text.replace(/(.)\1{2,}/g, '$1')

  // 移除重复的短语模式（如：你好你好 -> 你好）
  // 检测重复的2-4字符模式
  for (let len = 2; len <= 4; len++) {
    const regex = new RegExp(`(.{${len}})\\1+`, 'g')
    text = text.replace(regex, '$1')
  }

  // 移除多余的标点符号重复
  text = text.replace(/([。！？，、；：])\1+/g, '$1')

  return text.trim()
}

// 请求去重机制
const activeRequests = new Map()

// 新增：与Twitter用户扮演聊天的函数
async function chatWithTwitterPersona(twitterUsername, message, sessionId, aiServiceUrl) {
  // 创建请求唯一标识
  const requestKey = `${twitterUsername}_${message}_${sessionId}`

  // 如果相同请求正在处理，等待结果
  if (activeRequests.has(requestKey)) {
    console.log('等待重复请求完成:', requestKey)
    return await activeRequests.get(requestKey)
  }

  const requestPromise = new Promise(async (resolve, reject) => {
    const { io } = await import('socket.io-client')

    // 连接到main_farm2.py的WebSocket服务
    const socket = io(aiServiceUrl, {
      query: { p: twitterUsername },
      transports: ['websocket']
    })

    let responseReceived = false
    let fullResponse = ''

    // 设置超时
    const timeout = setTimeout(() => {
      if (!responseReceived) {
        socket.disconnect()
        reject(new Error('Response timeout'))
      }
    }, 30000) // 30秒超时

    socket.on('connect', () => {
      console.log(`Connected to AI service for Twitter user: ${twitterUsername}`)

      // 发送聊天消息
      socket.emit('chat', { query: message })
    })

    socket.on('session_id', (data) => {
      console.log(`Session initialized for ${twitterUsername}:`, data.session_id)
    })

    // 监听响应完成（通过检测响应流结束）
    let lastResponseTime = Date.now()

    socket.on('response', (data) => {
      if (data.chunk) {
        fullResponse += data.chunk
        lastResponseTime = Date.now() // 更新最后响应时间
      }
    })

    socket.on('error', (error) => {
      clearTimeout(timeout)
      socket.disconnect()
      reject(new Error(`AI service error: ${error.message}`))
    })

    const responseCheckInterval = setInterval(() => {
      if (fullResponse && Date.now() - lastResponseTime > 2000) { // 2秒无新响应则认为完成
        clearInterval(responseCheckInterval)
        clearTimeout(timeout)
        responseReceived = true
        socket.disconnect()
        // 过滤重复内容
        const cleanedResponse = cleanDuplicateText(fullResponse.trim())
        // 清理请求缓存
        activeRequests.delete(requestKey)
        resolve(cleanedResponse)
      }
    }, 500)

    socket.on('disconnect', () => {
      console.log(`Disconnected from AI service for Twitter user: ${twitterUsername}`)
    })
  })

  // 将Promise添加到活跃请求中
  activeRequests.set(requestKey, requestPromise)

  // 确保在出错时也清理缓存
  requestPromise.catch(() => {
    activeRequests.delete(requestKey)
  })

  return requestPromise
}

fastify.get('/api/agent/models', async (request, reply) => {
  try {
    // 返回可用的AI模型列表
    const models = [
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        description: '快速响应的通用AI模型',
        personality: ['helpful', 'creative', 'analytical']
      },
      {
        id: 'twitter-persona',
        name: 'Twitter Persona',
        description: '基于Twitter用户数据的个性化AI',
        personality: ['authentic', 'social', 'dynamic']
      },
      {
        id: 'custom-assistant',
        name: 'Custom Assistant',
        description: '可自定义的AI助手',
        personality: ['helpful', 'professional', 'friendly']
      }
    ]

    return reply.code(200).send({
      success: true,
      models: models
    })

  } catch (error) {
    console.error('Get models API error:', error)
    return reply.code(500).send({
      success: false,
      error: 'Failed to get models'
    })
  }
})

fastify.post('/api/agent/config', async (request, reply) => {
  try {
    const { agentId, config } = request.body

    if (!agentId || !config) {
      return reply.code(400).send({
        success: false,
        error: 'Missing required parameters: agentId, config'
      })
    }

    // 这里可以保存agent配置到数据库
    // 暂时返回成功响应
    return reply.code(200).send({
      success: true,
      message: 'Agent configuration updated',
      agentId: agentId,
      config: config
    })

  } catch (error) {
    console.error('Agent config API error:', error)
    return reply.code(500).send({
      success: false,
      error: 'Failed to update agent configuration'
    })
  }
})

// AI回复生成函数
async function generatePersonalizedReply(prompt, personality, language) {
  try {
    // 集成main_farm2.py的WebSocket服务进行AI对话
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'https://api.flizaos.com'

    // 尝试使用WebSocket进行实时对话
    // 注意：这里简化为HTTP调用，实际可以实现WebSocket连接
    const response = await fetch(`${aiServiceUrl}/get_user_tweets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: prompt.split('你是')[1]?.split('，')[0] || 'default_user',
        limit: 5
      })
    })

    if (response.ok) {
      const twitterData = await response.json()

      // 基于Twitter数据和个性生成回复
      const personalityResponses = {
        'helpful': '基于我的经验，我建议',
        'creative': '让我用创意的角度来看',
        'analytical': '从数据分析的角度',
        'friendly': '作为朋友，我想说',
        'professional': '从专业角度来看'
      }

      const baseResponse = personalityResponses[personality] || personalityResponses['helpful']
      const userMessage = prompt.split('用户说：')[1] || '这个问题'

      // 简化的AI回复逻辑
      return `${baseResponse}：${userMessage}确实是个好问题。基于我的理解，我认为这需要综合考虑多个因素。`
    }

    // 回退到简单回复
    const responses = {
      'helpful': '我很乐意帮助你！',
      'creative': '让我用创意的方式来回答你...',
      'analytical': '让我分析一下这个问题...',
      'friendly': '很高兴和你聊天！',
      'professional': '我来为您提供专业的建议。'
    }

    const baseResponse = responses[personality] || responses['helpful']
    return `${baseResponse} 关于您的问题：${prompt.split('用户说：')[1] || '我理解了您的意思。'}`

  } catch (error) {
    console.error('Error generating personalized reply:', error)
    return '抱歉，我现在无法生成个性化回复。'
  }
}

async function generateGenericReply(message, personality, language) {
  try {
    // 简单的关键词匹配回复系统
    const keywords = {
      '你好': ['你好！很高兴见到你！', '嗨！有什么可以帮助你的吗？', '你好！我是AI助手。'],
      '帮助': ['我很乐意帮助你！请告诉我你需要什么。', '当然可以帮助你！有什么问题吗？'],
      '谢谢': ['不客气！', '很高兴能帮到你！', '随时为你服务！'],
      '再见': ['再见！期待下次聊天！', '拜拜！有需要随时找我！', '再见！祝你有美好的一天！'],
      '天气': ['我无法获取实时天气信息，建议你查看天气应用。', '天气怎么样？我建议你看看窗外！'],
      '时间': [`现在是 ${new Date().toLocaleString('zh-CN')}`, '时间过得真快呢！'],
      '名字': ['我是AI助手，你可以叫我小助手！', '我是你的AI朋友！'],
    }

    // 查找匹配的关键词
    for (const [keyword, responses] of Object.entries(keywords)) {
      if (message.includes(keyword)) {
        const randomResponse = responses[Math.floor(Math.random() * responses.length)]
        return randomResponse
      }
    }

    // 默认回复
    const defaultResponses = [
      '这是一个很有趣的问题！',
      '我理解你的意思，让我想想...',
      '这个话题很有意思！',
      '你说得对，我同意你的观点。',
      '这确实值得思考。',
      '我觉得这个问题很重要。'
    ]

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]

  } catch (error) {
    console.error('Error generating generic reply:', error)
    return '抱歉，我现在无法理解您的问题。'
  }
}

fastify.setErrorHandler((err, req, reply) => {
  console.error(err)
  reply.status(500).send()
})

try {
  await fastify.listen({ port, host: '0.0.0.0' })
} catch (err) {
  console.error(err)
  console.error(`failed to launch on port ${port}`)
  process.exit(1)
}

async function worldNetwork(fastify) {
  fastify.get('/ws', { websocket: true }, (ws, req) => {
    console.log('WebSocket upgrade request from:', req.ip, 'User-Agent:', req.headers['user-agent'])
    console.log('Request headers:', {
      'x-forwarded-for': req.headers['x-forwarded-for'],
      'x-real-ip': req.headers['x-real-ip'],
      'connection': req.headers.connection,
      'upgrade': req.headers.upgrade
    })
    world.network.onConnection(ws, req.query)
  })

  // Agent专用WebSocket端点
  fastify.get('/ws/agent', { websocket: true }, (ws, req) => {
    console.log('Agent WebSocket connection from:', req.ip)

    const { agentName, personality, language } = req.query
    let aiServiceWs = null

    // 连接到main_farm2.py的WebSocket服务
    const connectToAIService = async () => {
      try {
        const aiServiceUrl = process.env.AI_SERVICE_URL || 'wss://api.flizaos.com'
        const WebSocket = require('ws')

        // 这里需要根据main_farm2.py的WebSocket协议进行连接
        // 暂时使用HTTP API作为替代
        console.log(`Agent ${agentName} connected with personality: ${personality}`)

      } catch (error) {
        console.error('Failed to connect to AI service:', error)
      }
    }

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString())

        if (message.type === 'chat') {
          // 处理聊天消息
          const reply = await generateChatReply(message.content, agentName, personality, language)

          ws.send(JSON.stringify({
            type: 'reply',
            content: reply,
            timestamp: new Date().toISOString()
          }))
        }

      } catch (error) {
        console.error('Agent WebSocket message error:', error)
        ws.send(JSON.stringify({
          type: 'error',
          content: 'Failed to process message'
        }))
      }
    })

    ws.on('close', () => {
      console.log(`Agent ${agentName} WebSocket disconnected`)
      if (aiServiceWs) {
        aiServiceWs.close()
      }
    })

    // 初始化连接
    connectToAIService()
  })
}

// 生成聊天回复的辅助函数
async function generateChatReply(message, agentName, personality, language) {
  try {
    // 如果agentName是Twitter用户名，获取用户数据
    if (agentName && agentName !== 'AI助手' && agentName !== 'AI Assistant') {
      const aiServiceUrl = process.env.AI_SERVICE_URL || 'https://api.flizaos.com'

      try {
        const userInfoResponse = await fetch(`${aiServiceUrl}/get_user_info`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: agentName
          })
        })

        if (userInfoResponse.ok) {
          const userData = await userInfoResponse.json()

          // 基于用户数据生成个性化回复
          const prompt = `你是${agentName}，基于以下信息回复用户：${JSON.stringify(userData.user_info)}。用户说：${message}`
          return await generatePersonalizedReply(prompt, personality, language)
        }
      } catch (error) {
        console.log('Failed to get Twitter user data, using generic reply')
      }
    }

    // 使用通用回复
    return await generateGenericReply(message, personality, language)

  } catch (error) {
    console.error('Error generating chat reply:', error)
    return language === 'zh-CN' ?
      '抱歉，我现在无法回复。' :
      'Sorry, I cannot reply right now.'
  }
}

console.log(`running on port ${port}`)

// Graceful shutdown
process.on('SIGINT', async () => {
  await fastify.close()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await fastify.close()
  process.exit(0)
})
