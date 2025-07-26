import { isBoolean, isString, isNumber } from 'lodash-es'
import { Node } from './Node'
import * as THREE from '../extras/three'

const defaults = {
  agentName: 'AI Assistant',
  model: null,
  apiEndpoint: 'https://api.flizaos.com/',
  personality: 'helpful',
  language: 'zh-CN',
  responseColor: '#00ff88',
  bubbleColor: 'rgba(0,0,0,0.8)',
  maxMessages: 10,
  autoGreeting: true,
  greetingMessage: '你好！我是AI助手，有什么可以帮助你的吗？',
  showAvatar: true,
  avatarScale: 1.0,
  uiScale: 1.0,
  position: [0, 0, 0],
  active: true
}

export class ChatAgent extends Node {
  constructor(data = {}) {
    super(data)
    this.name = 'chatagent'
    
    // Agent配置
    this._agentName = data.agentName || defaults.agentName
    this._model = data.model || defaults.model
    this._apiEndpoint = data.apiEndpoint || defaults.apiEndpoint
    this._personality = data.personality || defaults.personality
    this._language = data.language || defaults.language
    this._responseColor = data.responseColor || defaults.responseColor
    this._bubbleColor = data.bubbleColor || defaults.bubbleColor
    this._maxMessages = data.maxMessages || defaults.maxMessages
    this._autoGreeting = isBoolean(data.autoGreeting) ? data.autoGreeting : defaults.autoGreeting
    this._greetingMessage = data.greetingMessage || defaults.greetingMessage
    this._showAvatar = isBoolean(data.showAvatar) ? data.showAvatar : defaults.showAvatar
    this._avatarScale = data.avatarScale || defaults.avatarScale
    this._uiScale = data.uiScale || defaults.uiScale
    
    // 内部状态
    this.messages = []
    this.isTyping = false
    this.sessionId = null
    this.ui = null
    this.avatar = null
    this.chatContainer = null
    this.inputField = null
    this.messageElements = []
    this.isInitialized = false
  }

  mount() {
    if (this.isInitialized) return
    
    this.setupAvatar()
    this.setupUI()
    this.initializeSession()
    
    if (this._autoGreeting) {
      this.addMessage('agent', this._greetingMessage, this._responseColor)
    }
    
    this.isInitialized = true
  }

  unmount() {
    this.cleanup()
    this.isInitialized = false
  }

  setupAvatar() {
    if (!this._showAvatar || !this._model) return
    
    // 创建头像节点
    this.avatar = this.ctx.world.loader.load('model', this._model)
    if (this.avatar) {
      this.avatar.scale.setScalar(this._avatarScale)
      this.avatar.position.set(0, 0, 0)
      this.add(this.avatar)
    }
  }

  setupUI() {
    // 创建主UI容器
    this.ui = this.createNode('ui')
    this.ui.position.set(0, 2.5, 0)
    this.ui.width = 400 * this._uiScale
    this.ui.height = 350 * this._uiScale
    this.ui.billboard = true
    
    // 创建聊天容器
    this.chatContainer = this.createNode('uiview')
    this.chatContainer.width = 380 * this._uiScale
    this.chatContainer.height = 250 * this._uiScale
    this.chatContainer.backgroundColor = this._bubbleColor
    this.chatContainer.borderRadius = 10
    this.chatContainer.position.set(0, 30, 0)
    this.ui.add(this.chatContainer)
    
    // 创建标题
    const titleText = this.createNode('uitext')
    titleText.text = this._agentName
    titleText.fontSize = 18 * this._uiScale
    titleText.color = '#ffffff'
    titleText.position.set(0, 120, 0)
    titleText.textAlign = 'center'
    this.ui.add(titleText)
    
    // 创建输入框
    this.inputField = this.createNode('uitext')
    this.inputField.width = 280 * this._uiScale
    this.inputField.height = 35 * this._uiScale
    this.inputField.position.set(-50, -140, 0)
    this.inputField.placeholder = '输入消息...'
    this.inputField.backgroundColor = 'rgba(255,255,255,0.9)'
    this.inputField.borderRadius = 5
    this.inputField.padding = 8
    this.inputField.fontSize = 14 * this._uiScale
    this.ui.add(this.inputField)
    
    // 创建发送按钮
    const sendButton = this.createNode('uiview')
    sendButton.width = 70 * this._uiScale
    sendButton.height = 35 * this._uiScale
    sendButton.position.set(120, -140, 0)
    sendButton.backgroundColor = '#007bff'
    sendButton.borderRadius = 5
    sendButton.cursor = 'pointer'
    this.ui.add(sendButton)
    
    const sendText = this.createNode('uitext')
    sendText.text = '发送'
    sendText.color = 'white'
    sendText.fontSize = 14 * this._uiScale
    sendText.textAlign = 'center'
    sendButton.add(sendText)
    
    // 绑定事件
    sendButton.onClick = () => this.sendMessage()
    this.inputField.onEnter = () => this.sendMessage()
    
    this.add(this.ui)
  }

  createNode(type, data = {}) {
    // 使用应用的createNode方法
    if (this.ctx && this.ctx.entity && this.ctx.entity.createNode) {
      return this.ctx.entity.createNode(type, data)
    }
    // 回退到全局createNode
    const { createNode } = require('../extras/createNode')
    return createNode(type, data)
  }

  async initializeSession() {
    try {
      // 初始化会话
      this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      console.log(`ChatAgent session initialized: ${this.sessionId}`)
    } catch (error) {
      console.error('Failed to initialize chat session:', error)
    }
  }

  async sendMessage() {
    const userMessage = this.inputField.text.trim()
    if (!userMessage || this.isTyping) return
    
    // 添加用户消息
    this.addMessage('user', userMessage, '#ffffff')
    
    // 清空输入框
    this.inputField.text = ''
    
    // 设置正在输入状态
    this.isTyping = true
    this.showTypingIndicator()
    
    try {
      // 调用API获取回复
      const response = await this.callChatAPI(userMessage)
      
      // 移除输入指示器
      this.hideTypingIndicator()
      
      // 添加AI回复
      this.addMessage('agent', response, this._responseColor)
      
    } catch (error) {
      console.error('Chat API error:', error)
      this.hideTypingIndicator()
      this.addMessage('agent', '抱歉，我现在无法回复。请稍后再试。', '#ff6b6b')
    } finally {
      this.isTyping = false
    }
  }

  async callChatAPI(message) {
    const apiUrl = `${this._apiEndpoint.replace(/\/$/, '')}/api/agent/chat`
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        sessionId: this.sessionId,
        agentName: this._agentName,
        personality: this._personality,
        language: this._language
      })
    })
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }
    
    const data = await response.json()
    return data.reply || '抱歉，我无法理解您的问题。'
  }

  addMessage(sender, text, color) {
    const message = { sender, text, color, timestamp: Date.now() }
    this.messages.push(message)
    
    // 限制消息数量
    if (this.messages.length > this._maxMessages) {
      this.messages.shift()
      if (this.messageElements.length > 0) {
        const oldElement = this.messageElements.shift()
        this.chatContainer.remove(oldElement)
      }
    }
    
    // 创建消息元素
    this.createMessageElement(message)
  }

  createMessageElement(message) {
    const messageElement = this.createNode('uitext')
    const prefix = message.sender === 'user' ? '你' : this._agentName
    messageElement.text = `${prefix}: ${message.text}`
    messageElement.color = message.color
    messageElement.fontSize = 12 * this._uiScale
    messageElement.position.set(-180, 100 - this.messages.length * 20, 0)
    messageElement.width = 360 * this._uiScale
    messageElement.wordWrap = true
    
    this.chatContainer.add(messageElement)
    this.messageElements.push(messageElement)
  }

  showTypingIndicator() {
    if (this.typingIndicator) return
    
    this.typingIndicator = this.createNode('uitext')
    this.typingIndicator.text = `${this._agentName} 正在输入...`
    this.typingIndicator.color = '#888888'
    this.typingIndicator.fontSize = 11 * this._uiScale
    this.typingIndicator.position.set(-180, 100 - (this.messages.length + 1) * 20, 0)
    this.typingIndicator.width = 360 * this._uiScale
    
    this.chatContainer.add(this.typingIndicator)
  }

  hideTypingIndicator() {
    if (this.typingIndicator) {
      this.chatContainer.remove(this.typingIndicator)
      this.typingIndicator = null
    }
  }

  cleanup() {
    if (this.ui) {
      this.remove(this.ui)
      this.ui = null
    }
    if (this.avatar) {
      this.remove(this.avatar)
      this.avatar = null
    }
    this.messages = []
    this.messageElements = []
    this.sessionId = null
  }

  // Getters and setters for configuration
  get agentName() { return this._agentName }
  set agentName(value) { 
    this._agentName = value
    if (this.isInitialized) this.updateUI()
  }

  get model() { return this._model }
  set model(value) { 
    this._model = value
    if (this.isInitialized) this.updateAvatar()
  }

  get apiEndpoint() { return this._apiEndpoint }
  set apiEndpoint(value) { this._apiEndpoint = value }

  get personality() { return this._personality }
  set personality(value) { this._personality = value }

  updateUI() {
    // 重新初始化UI
    if (this.isInitialized) {
      this.cleanup()
      this.mount()
    }
  }

  updateAvatar() {
    if (this.avatar) {
      this.remove(this.avatar)
      this.avatar = null
    }
    this.setupAvatar()
  }
}
