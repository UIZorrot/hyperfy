// ChatAgent应用脚本 - 可对话的AI助手
// 使用mu-world内置聊天系统，无需自定义UI
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
    key: 'avatarModel',
    type: 'file',
    kind: 'model',
    label: '头像模型',
    hint: '选择3D头像模型文件（.glb或.vrm格式）'
  },
  {
    key: 'triggerDistance',
    type: 'number',
    label: '触发距离',
    dp: 1,
    step: 0.5,
    bigStep: 1.0,
    initial: 3.0,
    min: 1.0,
    max: 10.0,
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
let sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
let isPlayerNearby = false
let hasGreeted = false
let isProcessingMessage = false

// 设置头像缩放
if (avatarScale !== 1.0) {
  app.scale.setScalar(avatarScale)
  console.log('设置头像缩放:', avatarScale)
}

// 创建接近检测触发器
const proximityTrigger = app.create('collider')
proximityTrigger.type = 'box'
proximityTrigger.width = triggerDistance * 2
proximityTrigger.height = triggerDistance * 2
proximityTrigger.depth = triggerDistance * 2
proximityTrigger.trigger = true
proximityTrigger.position.set(0, triggerDistance / 2, 0)
proximityTrigger.visible = false // 隐形触发器

app.add(proximityTrigger)

// 监听聊天事件
world.on('chat', async (chatMessage) => {
  // 只处理来自玩家的消息，且玩家在附近
  if (!chatMessage.fromId || !isPlayerNearby || isProcessingMessage) return

  // 检查是否是对这个Agent说话（可以通过@agentName或直接说话）
  const message = chatMessage.body.trim()
  const isDirectMessage = message.startsWith(`@${agentName}`) ||
    message.startsWith(`@${twitterUsername}`) ||
    isPlayerNearby // 如果在附近，所有消息都视为对话

  if (!isDirectMessage) return

  // 移除@前缀
  const cleanMessage = message.replace(new RegExp(`^@(${agentName}|${twitterUsername})\\s*`, 'i'), '').trim()
  if (!cleanMessage) return

  isProcessingMessage = true

  try {
    // 调用AI API获取回复
    const response = await callChatAPI(cleanMessage)

    // 通过聊天系统发送回复
    const agentDisplayName = (enableTwitterPersona && twitterUsername) ?
      `@${twitterUsername}` : agentName

    world.chat.add({
      id: `agent_${Date.now()}`,
      from: agentDisplayName,
      fromId: null, // Agent没有玩家ID
      body: response,
      createdAt: new Date().toISOString(),
    }, true)

  } catch (error) {
    console.error('ChatAgent API error:', error)
    const errorMsg = language === 'zh-CN' ?
      '抱歉，我现在无法回复。' :
      'Sorry, I cannot reply right now.'

    world.chat.add({
      id: `agent_error_${Date.now()}`,
      from: agentName,
      fromId: null,
      body: errorMsg,
      createdAt: new Date().toISOString(),
    }, true)
  } finally {
    isProcessingMessage = false
  }
})

// 创建聊天容器
const chatContainer = app.create('uiview')
chatContainer.width = 380 * uiScale
chatContainer.height = 250 * uiScale
chatContainer.backgroundColor = bubbleColor
chatContainer.borderRadius = 10
chatContainer.position.set(0, 30, 0)
ui.add(chatContainer)

// 创建滚动区域
const scrollArea = app.create('uiview')
scrollArea.width = 360 * uiScale
scrollArea.height = 230 * uiScale
scrollArea.position.set(0, 0, 0)
scrollArea.overflow = 'scroll'
chatContainer.add(scrollArea)

// 创建输入框
const inputField = app.create('uitext')
inputField.width = 280 * uiScale
inputField.height = 35 * uiScale
inputField.position.set(-50, -140, 0)
inputField.placeholder = language === 'zh-CN' ? '输入消息...' : 'Type a message...'
inputField.backgroundColor = 'rgba(255,255,255,0.9)'
inputField.borderRadius = 5
inputField.padding = 8
inputField.fontSize = 14 * uiScale
inputField.color = '#333333'
ui.add(inputField)

// 创建发送按钮
const sendButton = app.create('uiview')
sendButton.width = 70 * uiScale
sendButton.height = 35 * uiScale
sendButton.position.set(120, -140, 0)
sendButton.backgroundColor = '#007bff'
sendButton.borderRadius = 5
sendButton.cursor = 'pointer'
ui.add(sendButton)

const sendText = app.create('uitext')
sendText.text = language === 'zh-CN' ? '发送' : 'Send'
sendText.color = 'white'
sendText.fontSize = 14 * uiScale
sendText.textAlign = 'center'
sendText.fontWeight = 'bold'
sendButton.add(sendText)

// 添加悬停效果
sendButton.onPointerEnter = () => {
  sendButton.backgroundColor = '#0056b3'
}
sendButton.onPointerLeave = () => {
  sendButton.backgroundColor = '#007bff'
}

// 创建接近触发器（隐形碰撞体）
proximityTrigger = app.create('collider')
proximityTrigger.type = 'box'
proximityTrigger.width = 3
proximityTrigger.height = 3
proximityTrigger.depth = 3
proximityTrigger.trigger = true
proximityTrigger.position.set(0, 1.5, 0)

// 初始时隐藏UI
ui.visible = false
isUIVisible = false

container.add(ui)
app.add(container)

// 设置接近检测事件
proximityTrigger.onTriggerEnter = (other) => {
  if (other.isPlayer) {
    showChatUI()
  }
}

proximityTrigger.onTriggerLeave = (other) => {
  if (other.isPlayer) {
    hideChatUI()
  }
}

app.add(proximityTrigger)

// 发送消息函数
async function sendMessage() {
  const userMessage = inputField.text.trim()
  if (!userMessage || isTyping) return

  // 添加用户消息
  addMessage('user', userMessage, userColor)

  // 清空输入框
  inputField.text = ''

  // 设置正在输入状态
  isTyping = true
  showTypingIndicator()

  try {
    // 调用API获取回复
    const response = await callChatAPI(userMessage)

    // 移除输入指示器
    hideTypingIndicator()

    // 添加AI回复
    addMessage('agent', response, responseColor)

  } catch (error) {
    console.error('Chat API error:', error)
    hideTypingIndicator()
    const errorMsg = language === 'zh-CN' ?
      '抱歉，我现在无法回复。请稍后再试。' :
      'Sorry, I cannot reply right now. Please try again later.'
    addMessage('agent', errorMsg, '#ff6b6b')
  } finally {
    isTyping = false
  }
}

// 调用聊天API - 优化以支持Twitter用户扮演
async function callChatAPI(message) {
  const apiUrl = `${world.assetsUrl.replace('/assets/', '')}/api/agent/chat`

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

// 添加消息到界面
function addMessage(sender, text, color) {
  const message = { sender, text, color, timestamp: Date.now() }
  messages.push(message)

  // 限制消息数量
  if (messages.length > maxMessages) {
    messages.shift()
    if (messageElements.length > 0) {
      const oldElement = messageElements.shift()
      scrollArea.remove(oldElement)
    }
  }

  // 创建消息元素
  createMessageElement(message)
}

// 创建消息元素
function createMessageElement(message) {
  const messageElement = app.create('uitext')

  let prefix
  if (message.sender === 'user') {
    prefix = language === 'zh-CN' ? '你' : 'You'
  } else {
    // 如果是Twitter扮演模式，显示@用户名
    if (enableTwitterPersona && twitterUsername) {
      prefix = `@${twitterUsername}`
    } else {
      prefix = agentName
    }
  }

  messageElement.text = `${prefix}: ${message.text}`
  messageElement.color = message.color
  messageElement.fontSize = 12 * uiScale
  messageElement.position.set(-170, 100 - messages.length * 25, 0)
  messageElement.width = 340 * uiScale
  messageElement.wordWrap = true
  messageElement.lineHeight = 1.2

  scrollArea.add(messageElement)
  messageElements.push(messageElement)

  // 自动滚动到底部
  scrollArea.scrollTop = scrollArea.scrollHeight
}

// 显示输入指示器
function showTypingIndicator() {
  if (typingIndicator) return

  typingIndicator = app.create('uitext')

  let typingName
  if (enableTwitterPersona && twitterUsername) {
    typingName = `@${twitterUsername}`
  } else {
    typingName = agentName
  }

  const typingText = language === 'zh-CN' ?
    `${typingName} 正在输入...` :
    `${typingName} is typing...`
  typingIndicator.text = typingText
  typingIndicator.color = '#888888'
  typingIndicator.fontSize = 11 * uiScale
  typingIndicator.position.set(-170, 100 - (messages.length + 1) * 25, 0)
  typingIndicator.width = 340 * uiScale
  typingIndicator.fontStyle = 'italic'

  scrollArea.add(typingIndicator)
  scrollArea.scrollTop = scrollArea.scrollHeight
}

// 隐藏输入指示器
function hideTypingIndicator() {
  if (typingIndicator) {
    scrollArea.remove(typingIndicator)
    typingIndicator = null
  }
}

// 显示聊天UI
function showChatUI() {
  if (!isUIVisible) {
    ui.visible = true
    isUIVisible = true
    console.log(`${agentName} 聊天界面已激活`)

    // 如果是第一次显示且启用自动问候
    if (autoGreeting && messages.length === 0) {
      let initialMessage = greetingMessage

      // 如果是Twitter扮演模式，自定义问候消息
      if (enableTwitterPersona && twitterUsername) {
        if (language === 'zh-CN') {
          initialMessage = `你好！我是 @${twitterUsername}，基于我的推文数据进行对话。有什么想聊的吗？`
        } else {
          initialMessage = `Hey! I'm @${twitterUsername}, chatting based on my tweet data. What's on your mind?`
        }
      }

      addMessage('agent', initialMessage, responseColor)
    }
  }
}

// 隐藏聊天UI
function hideChatUI() {
  if (isUIVisible) {
    ui.visible = false
    isUIVisible = false
    chatInputActive = false
    console.log(`${agentName} 聊天界面已隐藏`)
  }
}

// 绑定事件
sendButton.onClick = sendMessage
inputField.onEnter = sendMessage

// 初始化
console.log(`ChatAgent initialized: ${agentName} (Session: ${sessionId})`)
console.log('接近AI助手即可开始对话')

console.log(`ChatAgent initialized: ${agentName} (Session: ${sessionId})`)
