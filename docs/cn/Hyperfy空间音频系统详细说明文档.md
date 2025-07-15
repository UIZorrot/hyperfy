# Hyperfy 空间音频系统详细说明文档

## 🎵 概述

Hyperfy项目实现了基于WebAudio API和LiveKit的完整空间音频系统，支持3D位置音频、距离衰减、方向感知等高级功能。本文档详细分析了空间音频的实现机制，并提供了调整参数和实现广播模式的完整指南。

## 📁 核心文件结构

### 🎯 主要文件
```
src/core/systems/
├── ClientLiveKit.js        # LiveKit客户端 (13KB, 419行) - 语音聊天核心
├── ClientAudio.js          # 音频客户端 (4.5KB, 145行) - 音频系统管理
└── ServerLiveKit.js        # LiveKit服务器 (1.0KB, 37行) - 服务器配置

src/core/nodes/
├── Audio.js                # 音频节点 (13KB, 514行) - 音频播放组件
└── Video.js                # 视频节点 (29KB, 1166行) - 视频音频组件

src/client/components/
├── SettingsPane.js         # 设置面板 (9.3KB, 303行) - 音量控制UI
├── Sidebar.js              # 侧边栏 (48KB, 1628行) - 语音控制UI
└── MenuMain.js             # 主菜单 (10KB, 329行) - 音频设置入口
```

## 🔊 空间音频实现机制

### 📍 核心技术架构

#### 1. LiveKit + WebAudio 技术栈
```javascript
// ClientLiveKit.js - 语音聊天基础架构
class PlayerVoice {
  constructor(world, player, track, participant) {
    this.world = world
    this.player = player
    this.track = track
    this.participant = participant
    
    // ✨ 空间音频核心配置
    this.spatial = true                    // 空间音频开关
    this.panner = world.audio.ctx.createPanner()
    
    // 🎯 空间音频参数
    this.panner.panningModel = 'HRTF'      // 头部相关传输函数
    this.panner.distanceModel = 'inverse'   // 距离衰减模型
    this.panner.refDistance = 1            // 参考距离
    this.panner.maxDistance = 40           // 最大有效距离
    this.panner.rolloffFactor = 3          // 衰减系数
    this.panner.coneInnerAngle = 360       // 内锥角
    this.panner.coneOuterAngle = 360       // 外锥角
    this.panner.coneOuterGain = 0          // 外锥增益
    
    // 音频链路连接
    this.gain = world.audio.groupGains.voice
    this.panner.connect(this.gain)
    this.track.attach()
    this.track.setWebAudioPlugins([this.spatial ? this.panner : this.gain])
  }
}
```

#### 2. 实时位置更新系统
```javascript
// ClientLiveKit.js:247-264 - 实时音频位置同步
lateUpdate(delta) {
  const audio = this.world.audio
  const matrix = this.player.base.matrixWorld
  
  // 获取玩家3D位置和方向
  const pos = v1.setFromMatrixPosition(matrix)
  const qua = q1.setFromRotationMatrix(matrix)
  const dir = v2.set(0, 0, -1).applyQuaternion(qua)
  
  // 平滑更新音频源位置
  if (this.panner.positionX) {
    const endTime = audio.ctx.currentTime + audio.lastDelta
    this.panner.positionX.linearRampToValueAtTime(pos.x, endTime)
    this.panner.positionY.linearRampToValueAtTime(pos.y, endTime)
    this.panner.positionZ.linearRampToValueAtTime(pos.z, endTime)
    this.panner.orientationX.linearRampToValueAtTime(dir.x, endTime)
    this.panner.orientationY.linearRampToValueAtTime(dir.y, endTime)
    this.panner.orientationZ.linearRampToValueAtTime(dir.z, endTime)
  }
}
```

#### 3. 音频监听器系统
```javascript
// ClientAudio.js:93-110 - 监听器位置更新
lateUpdate(delta) {
  const target = this.world.rig  // 摄像机位置
  const dir = v1.set(0, 0, -1).applyQuaternion(target.quaternion)
  
  // 更新监听器位置和方向
  if (this.listener.positionX) {
    const endTime = this.ctx.currentTime + delta * 2
    this.listener.positionX.linearRampToValueAtTime(target.position.x, endTime)
    this.listener.positionY.linearRampToValueAtTime(target.position.y, endTime)
    this.listener.positionZ.linearRampToValueAtTime(target.position.z, endTime)
    this.listener.forwardX.linearRampToValueAtTime(dir.x, endTime)
    this.listener.forwardY.linearRampToValueAtTime(dir.y, endTime)
    this.listener.forwardZ.linearRampToValueAtTime(dir.z, endTime)
  }
}
```

### 🎚️ 音频分组系统

#### 音频分组管理 (ClientAudio.js:14-24)
```javascript
this.groupGains = {
  music: this.ctx.createGain(),    // 背景音乐
  sfx: this.ctx.createGain(),      // 音效
  voice: this.ctx.createGain(),    // 语音聊天 ✨
}

// 用户可独立调节各组音量
this.groupGains.music.gain.value = world.prefs.music    // 默认值
this.groupGains.sfx.gain.value = world.prefs.sfx        // 默认值
this.groupGains.voice.gain.value = world.prefs.voice    // 默认值 ✨
```

## 🔧 空间音频参数详解

### 📊 核心参数配置

#### 1. 距离衰减参数
```javascript
// 当前默认配置 - ClientLiveKit.js:232-239
this.panner.distanceModel = 'inverse'   // 距离模型
this.panner.refDistance = 1            // 参考距离 (1米)
this.panner.maxDistance = 40           // 最大距离 (40米)
this.panner.rolloffFactor = 3          // 衰减因子

// 📐 距离衰减公式 (inverse模型)
// gain = refDistance / (refDistance + rolloffFactor * (distance - refDistance))
// 示例计算：
// 距离1米: gain = 1 / (1 + 3 * 0) = 1.0 (100%)
// 距离5米: gain = 1 / (1 + 3 * 4) = 0.077 (7.7%)
// 距离10米: gain = 1 / (1 + 3 * 9) = 0.036 (3.6%)
// 距离40米: gain = 1 / (1 + 3 * 39) = 0.008 (0.8%)
```

#### 2. 空间化参数
```javascript
// HRTF 空间化配置
this.panner.panningModel = 'HRTF'      // 头部相关传输函数
this.panner.coneInnerAngle = 360       // 全向音源
this.panner.coneOuterAngle = 360       // 全向音源
this.panner.coneOuterGain = 0          // 外锥增益
```

#### 3. 支持的距离模型
```javascript
// Audio.js 支持三种距离模型
const distanceModels = ['linear', 'inverse', 'exponential']

// 'linear': 线性衰减
// gain = 1 - rolloffFactor * (distance - refDistance) / (maxDistance - refDistance)

// 'inverse': 反比衰减 (当前使用)
// gain = refDistance / (refDistance + rolloffFactor * (distance - refDistance))

// 'exponential': 指数衰减
// gain = pow(distance / refDistance, -rolloffFactor)
```

## 🎛️ 调整空间音频参数指南

### 📋 方法1：修改默认参数

#### 修改语音聊天参数 (`src/core/systems/ClientLiveKit.js`)
```javascript
// 找到 PlayerVoice 构造函数 (约232行)
class PlayerVoice {
  constructor(world, player, track, participant) {
    // ... 其他代码 ...
    
    // ✨ 自定义空间音频参数
    this.panner.distanceModel = 'inverse'   // 距离模型
    this.panner.refDistance = 2            // 🔧 参考距离 (1→2米，更近距离保持满音量)
    this.panner.maxDistance = 60           // 🔧 最大距离 (40→60米，扩大听声范围)
    this.panner.rolloffFactor = 2          // 🔧 衰减因子 (3→2，衰减更缓慢)
  }
}
```

#### 修改背景音频参数 (`src/core/nodes/Audio.js`)
```javascript
// 找到默认参数定义 (约14-25行)
const defaults = {
  // ... 其他参数 ...
  spatial: true,
  distanceModel: 'inverse',
  refDistance: 2,          // 🔧 修改参考距离
  maxDistance: 50,         // 🔧 修改最大距离
  rolloffFactor: 2,        // 🔧 修改衰减因子
  // ... 其他参数 ...
}
```

### 📋 方法2：动态参数配置

#### 添加配置系统
```javascript
// 在 PlayerVoice 类中添加参数配置方法
class PlayerVoice {
  constructor(world, player, track, participant) {
    // ... 现有代码 ...
    
    // 🔧 从配置读取参数
    const audioConfig = world.settings.spatialAudio || {}
    this.panner.refDistance = audioConfig.refDistance || 1
    this.panner.maxDistance = audioConfig.maxDistance || 40
    this.panner.rolloffFactor = audioConfig.rolloffFactor || 3
  }
  
  // 🔧 动态更新参数
  updateSpatialParams(config) {
    if (config.refDistance) this.panner.refDistance = config.refDistance
    if (config.maxDistance) this.panner.maxDistance = config.maxDistance
    if (config.rolloffFactor) this.panner.rolloffFactor = config.rolloffFactor
  }
}
```

### 📋 方法3：用户界面控制

#### 添加音频设置UI (`src/client/components/SettingsPane.js`)
```javascript
// 在 GeneralSettings 组件中添加空间音频设置
function GeneralSettings({ world, player }) {
  // ... 现有状态 ...
  const [spatialParams, setSpatialParams] = useState({
    refDistance: world.prefs.spatialRefDistance || 1,
    maxDistance: world.prefs.spatialMaxDistance || 40,
    rolloffFactor: world.prefs.spatialRolloffFactor || 3,
  })

  return (
    <div className='general noscrollbar'>
      {/* ... 现有设置 ... */}
      
      {/* ✨ 新增空间音频设置 */}
      <div className='general-section'>
        <Volume2Icon size={16} />
        <span>Spatial Audio</span>
      </div>
      <div className='general-field'>
        <div className='general-field-label'>Near Distance</div>
        <div className='general-field-input'>
          <InputRange
            value={spatialParams.refDistance}
            onChange={value => {
              setSpatialParams(prev => ({ ...prev, refDistance: value }))
              world.prefs.setSpatialRefDistance(value)
            }}
            min={0.5}
            max={5}
            step={0.1}
            instant
          />
        </div>
      </div>
      <div className='general-field'>
        <div className='general-field-label'>Max Distance</div>
        <div className='general-field-input'>
          <InputRange
            value={spatialParams.maxDistance}
            onChange={value => {
              setSpatialParams(prev => ({ ...prev, maxDistance: value }))
              world.prefs.setSpatialMaxDistance(value)
            }}
            min={10}
            max={100}
            step={1}
            instant
          />
        </div>
      </div>
      <div className='general-field'>
        <div className='general-field-label'>Rolloff Factor</div>
        <div className='general-field-input'>
          <InputRange
            value={spatialParams.rolloffFactor}
            onChange={value => {
              setSpatialParams(prev => ({ ...prev, rolloffFactor: value }))
              world.prefs.setSpatialRolloffFactor(value)
            }}
            min={0.5}
            max={5}
            step={0.1}
            instant
          />
        </div>
      </div>
    </div>
  )
}
```

## 📢 广播模式实现指南

### 🎯 方案1：全局语音模式

#### 1. 添加广播状态管理
```javascript
// 修改 ClientLiveKit.js
export class ClientLiveKit extends System {
  constructor(world) {
    super(world)
    // ... 现有代码 ...
    this.broadcastMode = false  // ✨ 广播模式开关
  }
  
  // ✨ 切换广播模式
  setBroadcastMode(enabled) {
    this.broadcastMode = enabled
    
    // 更新所有现有语音的空间化设置
    for (const [playerId, voice] of this.voices) {
      voice.setSpatial(!enabled)
    }
  }
}
```

#### 2. 修改 PlayerVoice 类
```javascript
// 修改 PlayerVoice 类支持动态切换空间化
class PlayerVoice {
  constructor(world, player, track, participant) {
    // ... 现有代码 ...
    this.world = world
    this.spatialEnabled = true  // ✨ 空间化状态
    this.setupAudioChain()
  }
  
  // ✨ 设置音频处理链
  setupAudioChain() {
    if (this.spatialEnabled && !this.world.livekit.broadcastMode) {
      // 空间音频模式
      this.track.setWebAudioPlugins([this.panner])
    } else {
      // 广播模式 - 直接连接到增益节点
      this.track.setWebAudioPlugins([this.gain])
    }
  }
  
  // ✨ 动态切换空间化
  setSpatial(enabled) {
    this.spatialEnabled = enabled
    this.setupAudioChain()
  }
  
  lateUpdate(delta) {
    // 只在空间化模式下更新位置
    if (this.spatialEnabled && !this.world.livekit.broadcastMode) {
      // ... 现有位置更新代码 ...
    }
  }
}
```

### 🎯 方案2：分层广播系统

#### 1. 多层级音频系统
```javascript
// 扩展音频分组系统 - ClientAudio.js
this.groupGains = {
  music: this.ctx.createGain(),
  sfx: this.ctx.createGain(),
  voice: this.ctx.createGain(),
  broadcast: this.ctx.createGain(),    // ✨ 广播音频组
  emergency: this.ctx.createGain(),    // ✨ 紧急广播组
}

// 设置广播音频优先级
this.groupGains.broadcast.gain.value = world.prefs.broadcast || 1.5
this.groupGains.emergency.gain.value = world.prefs.emergency || 2.0
```

#### 2. 广播权限系统
```javascript
// 添加广播权限检查 - PlayerVoice
class PlayerVoice {
  constructor(world, player, track, participant) {
    // ... 现有代码 ...
    this.broadcastLevel = this.getBroadcastLevel(player)  // ✨ 广播等级
  }
  
  // ✨ 获取玩家广播权限
  getBroadcastLevel(player) {
    if (player.data.roles?.includes('admin')) return 'emergency'
    if (player.data.roles?.includes('moderator')) return 'broadcast'
    return 'voice'  // 普通语音
  }
  
  // ✨ 设置广播模式
  setBroadcastMode(level) {
    if (!this.canBroadcast(level)) return false
    
    this.currentBroadcastLevel = level
    const gainNode = this.world.audio.groupGains[level]
    
    if (level === 'voice') {
      // 普通空间语音
      this.track.setWebAudioPlugins([this.panner])
    } else {
      // 广播模式
      this.track.setWebAudioPlugins([gainNode])
    }
    
    return true
  }
  
  canBroadcast(level) {
    const permissions = {
      'voice': 0,
      'broadcast': 1,
      'emergency': 2
    }
    return permissions[this.broadcastLevel] >= permissions[level]
  }
}
```

### 🎯 方案3：区域广播系统

#### 1. 基于区域的广播
```javascript
// 添加区域广播功能
class PlayerVoice {
  constructor(world, player, track, participant) {
    // ... 现有代码 ...
    this.broadcastZones = new Set()  // ✨ 广播区域
  }
  
  // ✨ 设置区域广播
  setBroadcastZones(zones) {
    this.broadcastZones = new Set(zones)
  }
  
  lateUpdate(delta) {
    const playerPos = this.player.base.position
    
    // 检查是否在广播区域内
    const inBroadcastZone = Array.from(this.broadcastZones).some(zone => {
      return playerPos.distanceTo(zone.center) <= zone.radius
    })
    
    if (inBroadcastZone) {
      // 在广播区域内 - 使用广播模式
      this.track.setWebAudioPlugins([this.world.audio.groupGains.broadcast])
    } else {
      // 在广播区域外 - 使用空间音频
      this.track.setWebAudioPlugins([this.panner])
      // ... 现有位置更新代码 ...
    }
  }
}
```

### 🎮 广播模式用户界面

#### 1. 广播控制按钮 (`src/client/components/Sidebar.js`)
```javascript
// 添加广播模式切换按钮
function VoiceControls({ world, player }) {
  const [broadcastMode, setBroadcastMode] = useState(false)
  const [canBroadcast, setCanBroadcast] = useState(false)
  
  useEffect(() => {
    // 检查广播权限
    const hasPermission = player.data.roles?.includes('admin') || 
                         player.data.roles?.includes('moderator')
    setCanBroadcast(hasPermission)
  }, [player.data.roles])
  
  const toggleBroadcast = () => {
    if (!canBroadcast) return
    const newMode = !broadcastMode
    setBroadcastMode(newMode)
    world.livekit.setBroadcastMode(newMode)
  }
  
  return (
    <div className="voice-controls">
      {/* ... 现有控制 ... */}
      
      {/* ✨ 广播模式切换 */}
      {canBroadcast && (
        <button
          className={`broadcast-btn ${broadcastMode ? 'active' : ''}`}
          onClick={toggleBroadcast}
          title={broadcastMode ? 'Exit Broadcast Mode' : 'Enter Broadcast Mode'}
        >
          <RadioIcon size={20} />
          {broadcastMode ? 'Broadcasting' : 'Broadcast'}
        </button>
      )}
    </div>
  )
}
```

#### 2. 广播状态指示器
```javascript
// 添加广播状态显示
function BroadcastIndicator({ world }) {
  const [activeBroadcasters, setActiveBroadcasters] = useState([])
  
  useEffect(() => {
    const updateBroadcasters = () => {
      const broadcasters = Array.from(world.livekit.voices.values())
        .filter(voice => voice.currentBroadcastLevel !== 'voice')
        .map(voice => ({
          name: voice.player.data.name,
          level: voice.currentBroadcastLevel
        }))
      setActiveBroadcasters(broadcasters)
    }
    
    world.livekit.on('broadcastChange', updateBroadcasters)
    return () => world.livekit.off('broadcastChange', updateBroadcasters)
  }, [])
  
  if (activeBroadcasters.length === 0) return null
  
  return (
    <div className="broadcast-indicator">
      <RadioIcon size={16} />
      <span>Broadcasting: {activeBroadcasters.map(b => b.name).join(', ')}</span>
    </div>
  )
}
```

## 🛠️ 实施步骤总结

### 📋 调整空间音频参数
1. **简单调整**: 直接修改 `ClientLiveKit.js` 中的默认参数
2. **配置系统**: 添加设置存储和动态更新机制
3. **用户界面**: 在设置面板中添加可调节的滑块控件

### 📋 实现广播模式
1. **基础广播**: 添加全局语音开关，禁用空间化处理
2. **权限系统**: 基于用户角色控制广播权限
3. **区域广播**: 实现基于位置的选择性广播
4. **用户界面**: 添加广播控制按钮和状态指示器

### 📋 推荐参数设置

#### 更大听声范围配置
```javascript
this.panner.refDistance = 2      // 参考距离: 2米
this.panner.maxDistance = 60     // 最大距离: 60米  
this.panner.rolloffFactor = 1.5  // 衰减因子: 1.5 (更缓慢)
```

#### 更小私密对话配置
```javascript
this.panner.refDistance = 0.5    // 参考距离: 0.5米
this.panner.maxDistance = 15     // 最大距离: 15米
this.panner.rolloffFactor = 4    // 衰减因子: 4 (更快衰减)
```

## 🔧 调试与测试

### 🔍 音频调试工具
```javascript
// 添加音频调试信息
class PlayerVoice {
  debug() {
    const playerPos = this.player.base.position
    const listenerPos = this.world.audio.listener.positionX?.value
    const distance = playerPos.distanceTo(new THREE.Vector3(
      listenerPos, 
      this.world.audio.listener.positionY?.value,
      this.world.audio.listener.positionZ?.value
    ))
    
    console.log('Voice Debug:', {
      playerId: this.player.data.id,
      distance: distance.toFixed(2),
      gain: this.calculateGain(distance).toFixed(3),
      spatial: this.spatialEnabled,
      broadcast: this.world.livekit.broadcastMode
    })
  }
  
  calculateGain(distance) {
    const { refDistance, maxDistance, rolloffFactor } = this.panner
    return refDistance / (refDistance + rolloffFactor * (distance - refDistance))
  }
}

// 在浏览器控制台中测试
// world.livekit.voices.forEach(voice => voice.debug())
```

### ⚡ 性能监控
```javascript
// 音频性能监控
const audioStats = {
  voiceCount: world.livekit.voices.size,
  spatialVoices: Array.from(world.livekit.voices.values()).filter(v => v.spatialEnabled).length,
  broadcastVoices: Array.from(world.livekit.voices.values()).filter(v => !v.spatialEnabled).length,
  audioContext: world.audio.ctx.state
}
```

## 📊 技术优势

### ✅ 现有功能优势
- ✅ **真实3D空间化**: 基于HRTF的头部相关传输函数
- ✅ **平滑位置更新**: 线性插值避免音频跳跃
- ✅ **多种距离模型**: 支持线性、反比、指数衰减
- ✅ **音频分组管理**: 独立控制音乐、音效、语音音量
- ✅ **实时同步**: LiveKit确保低延迟语音传输
- ✅ **跨平台兼容**: WebAudio API广泛支持

### 🚀 扩展功能潜力
- 🔲 **自适应音质**: 根据距离动态调整音频质量
- 🔲 **回声消除**: 基于空间位置的智能回声处理
- 🔲 **音频特效**: 实时添加混响、滤波等空间效果
- 🔲 **语音活动检测**: 智能检测说话状态优化传输
- 🔲 **多语言支持**: 基于语言的音频处理优化

---

**文档版本**: v1.0  
**更新时间**: 2025年1月8日  
**适用版本**: Hyperfy v0.13.0+  
**技术栈**: LiveKit + WebAudio API + Three.js 