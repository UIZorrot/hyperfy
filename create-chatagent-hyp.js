#!/usr/bin/env node

/**
 * 创建ChatAgent的.hyp文件
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function createChatAgentHyp() {
  console.log('🔧 创建ChatAgent.hyp文件...')

  try {
    // 读取脚本文件
    const scriptPath = path.join(__dirname, 'src/world/assets/chat-agent-simple.js')
    const scriptContent = fs.readFileSync(scriptPath, 'utf8')

    // 读取模型文件
    const modelPath = path.join(__dirname, 'src/world/assets/avatar.vrm')
    const modelContent = fs.readFileSync(modelPath)

    // 创建blueprint
    const blueprint = {
      name: "AI对话助手",
      description: "可配置的AI对话助手，支持Twitter用户扮演",
      author: "Farm2 Team",
      image: null,
      url: null,
      script: "asset://chat-agent-simple.js",
      model: "asset://avatar.vrm",
      props: {
        agentName: "AI助手",
        twitterUsername: "",
        enableTwitterPersona: true,
        personality: "helpful",
        language: "zh-CN",
        responseColor: "#00ff88",
        userColor: "#ffffff",
        bubbleColor: "rgba(0,0,0,0.8)",
        uiScale: 1.0,
        avatarScale: 1.0,
        autoGreeting: true,
        greetingMessage: "你好！我是AI助手，有什么可以帮助你的吗？",
        maxMessages: 10,
        showAvatar: true
      },
      preload: false,
      public: true,
      locked: false,
      frozen: false,
      unique: false,
      disabled: false
    }

    // 创建assets数组
    const assets = [
      {
        type: 'avatar',
        url: 'asset://avatar.vrm',
        size: modelContent.length,
        mime: 'application/octet-stream'
      },
      {
        type: 'script',
        url: 'asset://chat-agent-simple.js',
        size: scriptContent.length,
        mime: 'application/javascript'
      }
    ]

    // 创建header
    const header = {
      blueprint,
      assets
    }

    // 转换为字节
    const headerBytes = Buffer.from(JSON.stringify(header), 'utf8')
    const headerSize = Buffer.alloc(4)
    headerSize.writeUInt32LE(headerBytes.length, 0)

    // 创建最终文件
    const scriptBytes = Buffer.from(scriptContent, 'utf8')
    const hypData = Buffer.concat([headerSize, headerBytes, modelContent, scriptBytes])

    // 写入文件
    const outputPath = path.join(__dirname, 'src/world/collections/default/ChatAgent.hyp')
    fs.writeFileSync(outputPath, hypData)

    console.log('✅ ChatAgent.hyp 创建成功!')
    console.log('📁 文件位置:', outputPath)
    console.log('📊 文件大小:', hypData.length, 'bytes')
    console.log('')
    console.log('🎯 使用方法:')
    console.log('1. 将 ChatAgent.hyp 文件拖拽到mu-world界面中')
    console.log('2. 或者通过文件上传功能导入')
    console.log('3. 配置参数后放置在世界中')

  } catch (error) {
    console.error('❌ 创建失败:', error.message)
  }
}

// 运行
createChatAgentHyp()
