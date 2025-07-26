// ChatAgent应用脚本 - 使用内置聊天系统的AI助手
app.configure([
  {
    key: 'agentName',
    type: 'text',
    label: 'Agent名称',
    initial: 'AI助手',
    hint: '设置AI助手的显示名称'
  },
  {
    key: 'twitterUsername',
    type: 'text',
    label: 'X(Twitter)用户名',
    initial: '',
    hint: '填写X用户名，AI将扮演该用户进行对话（例如：elonmusk, naval, etc.）'
  },
  {
    key: 'enableTwitterPersona',
    type: 'toggle',
    label: '启用X用户扮演',
    initial: true,
    hint: '启用后，AI将基于指定X用户的推文数据和个性进行扮演'
  },
  {
    key: 'personality',
    type: 'switch',
    label: '个性类型',
    options: [
      { label: '友善助手', value: 'helpful' },
      { label: '创意伙伴', value: 'creative' },
      { label: '分析专家', value: 'analytical' },
      { label: '专业顾问', value: 'professional' },
      { label: '友好聊天', value: 'friendly' }
    ],
    initial: 'helpful',
    hint: '选择AI的个性类型'
  },
  {
    key: 'language',
    type: 'switch',
    label: '语言',
    options: [
      { label: '中文', value: 'zh-CN' },
      { label: 'English', value: 'en-US' },
      { label: '日本語', value: 'ja-JP' }
    ],
    initial: 'zh-CN',
    hint: '选择对话语言'
  },
  {
    key: 'triggerDistance',
    type: 'number',
    label: '触发距离',
    dp: 1,
    step: 0.5,
    bigStep: 1.0,
    initial: 2.0,
    min: 1.0,
    max: 5.0,
    hint: '玩家需要距离多近才能与AI对话'
  },
  {
    key: 'avatarScale',
    type: 'number',
    label: '头像缩放',
    dp: 1,
    step: 0.1,
    bigStep: 0.5,
    initial: 1.0,
    min: 0.1,
    max: 5.0,
    hint: '调整3D头像的大小'
  },
  {
    key: 'autoGreeting',
    type: 'toggle',
    label: '自动问候',
    initial: true,
    hint: '是否在用户接近时自动发送问候消息'
  },
  {
    key: 'greetingMessage',
    type: 'text',
    label: '问候消息',
    initial: '你好！我是AI助手，有什么可以帮助你的吗？',
    hint: '自定义问候消息内容'
  }
])

app.keepActive = true

// 获取配置参数
const agentName = props.agentName || 'AI助手'
const twitterUsername = props.twitterUsername || ''
const enableTwitterPersona = props.enableTwitterPersona !== false
const personality = props.personality || 'helpful'
const language = props.language || 'zh-CN'
const triggerDistance = props.triggerDistance || 3.0
const avatarScale = props.avatarScale || 1.0
const autoGreeting = props.autoGreeting !== false
const greetingMessage = props.greetingMessage || '你好！我是AI助手，有什么可以帮助你的吗？'

// 应用状态
let sessionId = `session_${world.getTime()}_${Math.random().toString(36).substr(2, 9)}`
let isPlayerNearby = false
let hasGreeted = false
let isProcessingMessage = false
let lastGreetingTime = 0
let lastResponseTime = 0
let currentNearbyPlayerId = null

// 设置头像缩放
if (avatarScale !== 1.0) {
  app.scale.setScalar(avatarScale)
  console.log('设置头像缩放:', avatarScale)
}

// 使用轮询方式检测附近玩家，不再使用触发器
console.log(`接近检测设置: 触发距离=${triggerDistance}米, 检测方式=轮询`)

// 使用轮询方式检测附近玩家（替代触发器）
function checkNearbyPlayers() {
  const agentPosition = app.position
  console.log(`Agent位置: (${agentPosition.x.toFixed(2)}, ${agentPosition.y.toFixed(2)}, ${agentPosition.z.toFixed(2)})`)

  const players = world.getPlayers()
  console.log(`当前世界中玩家数量: ${players.length}`)

  let nearbyPlayer = null
  let minDistance = Infinity

  for (const player of players) {
    const playerPosition = player.position
    console.log(`玩家 ${player.id} 位置: (${playerPosition.x.toFixed(2)}, ${playerPosition.y.toFixed(2)}, ${playerPosition.z.toFixed(2)})`)

    // 计算距离（忽略Y轴差异，只计算水平距离）
    const dx = agentPosition.x - playerPosition.x
    const dz = agentPosition.z - playerPosition.z
    const distance = Math.sqrt(dx * dx + dz * dz)

    console.log(`玩家 ${player.id} 距离Agent: ${distance.toFixed(2)}米`)

    if (distance <= triggerDistance && distance < minDistance) {
      nearbyPlayer = player
      minDistance = distance
    }
  }

  const wasNearby = isPlayerNearby
  isPlayerNearby = nearbyPlayer !== null

  if (isPlayerNearby && !wasNearby) {
    console.log(`✅ 玩家接近了 ${agentName} (playerId: ${nearbyPlayer.id}, 距离: ${minDistance.toFixed(2)}米)`)
    currentNearbyPlayerId = nearbyPlayer.id

    // 发送自动问候消息 - 添加防重复机制
    const currentTime = world.getTime()
    if (autoGreeting && !hasGreeted && (currentTime - lastGreetingTime > 5000)) {
      hasGreeted = true
      lastGreetingTime = currentTime

      let greetingMsg = greetingMessage
      if (enableTwitterPersona && twitterUsername) {
        if (language === 'zh-CN') {
          greetingMsg = `你好！我是 @${twitterUsername}，基于我的推文数据进行对话。请使用 @${twitterUsername} 消息内容 的格式与我对话！`
        } else {
          greetingMsg = `Hey! I'm @${twitterUsername}, chatting based on my tweet data. Use @${twitterUsername} message format to chat with me!`
        }
      }

      const agentDisplayName = (enableTwitterPersona && twitterUsername) ?
        `@${twitterUsername}` : agentName

      world.chat({
        id: `agent_greeting_${currentTime}`,
        from: agentDisplayName,
        fromId: null,
        body: greetingMsg,
        createdAt: world.getTimestamp(),
      }, true)
    }
  } else if (!isPlayerNearby && wasNearby) {
    console.log(`❌ 玩家离开了 ${agentName}`)
    // 重置问候状态，下次接近时可以重新问候
    hasGreeted = false
    currentNearbyPlayerId = null
  }
}

// 使用mu-world的更新循环进行轮询检测
const checkInterval = 3000 // 3秒检测一次

console.log('设置轮询检测...')

// 使用递归setTimeout进行轮询检测
function startDetectionLoop() {
  console.log('执行定时玩家检测...')
  checkNearbyPlayers()

  // 递归调用，持续检测
  setTimeout(startDetectionLoop, checkInterval)
}

// 启动检测循环
startDetectionLoop()

// 轮询检测已启动，无需额外初始化

// 添加消息去重机制
let processedMessages = new Set()

// 监听聊天事件
world.on('chat', async (chatMessage) => {
  console.log('ChatAgent收到聊天消息:', chatMessage)
  console.log('玩家是否在附近:', isPlayerNearby)
  console.log('是否正在处理消息:', isProcessingMessage)

  // 检查消息是否已经处理过
  if (processedMessages.has(chatMessage.id)) {
    console.log('跳过重复消息:', chatMessage.id)
    return
  }

  // 只处理来自玩家的消息，且玩家在附近
  if (!chatMessage.fromId || !isPlayerNearby || isProcessingMessage) {
    console.log('跳过消息处理 - fromId:', chatMessage.fromId, 'nearby:', isPlayerNearby, 'processing:', isProcessingMessage)
    return
  }

  // 标记消息为已处理
  processedMessages.add(chatMessage.id)

  // 清理旧的消息ID（保留最近100条）
  if (processedMessages.size > 100) {
    const oldMessages = Array.from(processedMessages).slice(0, 50)
    oldMessages.forEach(id => processedMessages.delete(id))
  }

  // 检查是否是对这个Agent说话（必须@机器人名字）
  const message = chatMessage.body.trim()
  const isDirectMessage = message.startsWith(`@${agentName}`) ||
    (twitterUsername && message.startsWith(`@${twitterUsername}`))

  if (!isDirectMessage) {
    console.log('消息不是@这个机器人，跳过处理')
    return
  }

  // 只有在附近才能对话
  if (!isPlayerNearby) {
    console.log('玩家不在附近，跳过消息处理')
    return
  }

  // 移除@前缀
  const cleanMessage = message.replace(new RegExp(`^@(${agentName}|${twitterUsername})\\s*`, 'i'), '').trim()
  if (!cleanMessage) return

  isProcessingMessage = true
  console.log('开始处理消息:', cleanMessage)

  try {

    // 调用AI API获取回复
    console.log('调用API...')
    const response = await callChatAPI(cleanMessage)
    console.log('API返回:', response)

    // 通过聊天系统发送回复 - 添加@回复
    const agentDisplayName = (enableTwitterPersona && twitterUsername) ?
      `@${twitterUsername}` : agentName

    // 构建回复消息，@回复发送者
    const replyMessage = `@${chatMessage.from} ${response}`

    world.chat({
      id: `agent_${world.getTime()}`,
      from: agentDisplayName,
      fromId: null, // Agent没有玩家ID
      body: replyMessage,
      createdAt: world.getTimestamp(),
    }, true)

  } catch (error) {
    console.error('ChatAgent API error:', error)
    const errorMsg = language === 'zh-CN' ?
      '抱歉，我现在无法回复。' :
      'Sorry, I cannot reply right now.'

    world.chat({
      id: `agent_error_${world.getTime()}`,
      from: agentName,
      fromId: null,
      body: errorMsg,
      createdAt: world.getTimestamp(),
    }, true)
  } finally {
    isProcessingMessage = false
  }
})

// 调用聊天API
async function callChatAPI(message) {
  // 构建API URL - 使用完整URL
  const apiUrl = `http://localhost:3011/api/agent/chat`

  const requestBody = {
    message: message,
    sessionId: sessionId,
    agentName: agentName,
    personality: personality,
    language: language
  }

  // 如果启用Twitter扮演且有用户名，添加Twitter用户名参数
  if (enableTwitterPersona && twitterUsername && twitterUsername.trim() !== '') {
    requestBody.twitterUsername = twitterUsername.trim()
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }

  const data = await response.json()

  // 如果是Twitter扮演模式，显示特殊提示
  if (data.twitterUser) {
    console.log(`Response from Twitter persona: @${data.twitterUser}`)
  }

  return data.reply || (language === 'zh-CN' ? '抱歉，我无法理解您的问题。' : 'Sorry, I cannot understand your question.')
}

// 初始化
console.log(`ChatAgent initialized: ${agentName} (Session: ${sessionId})`)
console.log('接近AI助手并在聊天中输入消息即可开始对话')
console.log('使用方法: 按Enter键打开聊天，然后输入消息')
if (enableTwitterPersona && twitterUsername) {
  console.log(`Twitter扮演模式: @${twitterUsername}`)
}
