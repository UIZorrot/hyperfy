# Hyperfy 角色控制系统详细说明文档

## 🎮 概述

Hyperfy项目实现了一套完整的3D角色控制系统，支持多种移动模式、动画系统和交互功能。本文档详细分析了现有的角色控制机制，并提供了扩展新动作动画的完整指南。

## 📁 核心文件结构

### 🎯 主要文件
```
src/core/
├── entities/
│   ├── PlayerLocal.js          # 本地玩家实体 (36KB, 1047行) - 核心控制逻辑
│   └── PlayerRemote.js         # 远程玩家实体 (6.2KB, 227行) - 网络同步
├── systems/
│   └── ClientControls.js       # 客户端控制系统 (22KB, 767行) - 输入处理
├── nodes/
│   └── Avatar.js               # 头像节点 (4.0KB, 193行) - 角色渲染
├── extras/
│   ├── playerEmotes.js         # 表情动画定义 (12行) - 动画配置
│   └── createVRMFactory.js     # VRM工厂 (341行) - 角色模型处理
└── world/assets/
    ├── avatar.vrm              # 默认头像模型 (4.6MB)
    ├── emote-*.glb             # 动画文件集合
    └── ... (其他表情动画文件)
```

## 🚀 移动控制系统

### 📍 移动模式分析

#### 1. 地面移动模式 (Ground Movement)
```javascript
// 基础参数设置 - PlayerLocal.js:48-85
this.mass = 1                    // 玩家质量
this.gravity = 20                // 重力加速度
this.jumpHeight = 1.5            // 跳跃高度
this.capsuleRadius = 0.3         // 碰撞胶囊半径
this.capsuleHeight = 1.6         // 碰撞胶囊高度

// 移动速度控制 - PlayerLocal.js:577-585
let moveSpeed = (this.running ? 8 : 4) * this.mass  // 跑步:8, 走路:4
const moveForce = v1.copy(this.moveDir)
  .multiplyScalar(moveSpeed * 10)
  .applyQuaternion(slopeRotation)
this.capsule.addForce(moveForce.toPxVec3())
```

#### 2. 飞行模式 (Flying Mode)
```javascript
// 飞行参数 - PlayerLocal.js:73-75
this.flying = false              // 飞行状态
this.flyForce = 100              // 飞行力度
this.flyDrag = 300               // 飞行阻力

// 飞行控制 - PlayerLocal.js:618-639
const flySpeed = this.flyForce * (this.running ? 2 : 1)
const force = v1.copy(this.flyDir).multiplyScalar(flySpeed)
if (this.jumpDown) force.y = flySpeed           // 上升
if (this.control.keyC.down) force.y = -flySpeed // 下降
```

### 🎯 输入控制映射

#### 键盘控制 (ClientControls.js & PlayerLocal.js:736-745)
```javascript
// WASD 移动
if (this.control.keyW.down) this.moveDir.z -= 1  // 前进
if (this.control.keyS.down) this.moveDir.z += 1  // 后退
if (this.control.keyA.down) this.moveDir.x -= 1  // 左移
if (this.control.keyD.down) this.moveDir.x += 1  // 右移

// 特殊控制
Space: 跳跃/二段跳              // this.control.space.pressed
Shift: 奔跑                    // this.control.shiftLeft.down
C: 飞行模式下降                // this.control.keyC.down
```

#### VR控制 (PlayerLocal.js:715-717)
```javascript
// VR 手柄摇杆
this.moveDir.x = this.control.xrLeftStick.value.x
this.moveDir.z = this.control.xrLeftStick.value.z
// VR 按钮
this.control.xrRightBtn1.pressed  // 跳跃按钮
```

#### 触屏控制 (PlayerLocal.js:718-735)
```javascript
// 虚拟摇杆系统
const stickX = (touchX - this.stick.center.x) / STICK_MAX_DISTANCE
const stickY = (touchY - this.stick.center.y) / STICK_MAX_DISTANCE
this.moveDir.x = stickX
this.moveDir.z = stickY
```

### 🔧 物理系统集成

#### PhysX 物理引擎
```javascript
// 胶囊碰撞体创建 - PlayerLocal.js:185-207
const radius = this.capsuleRadius
const height = this.capsuleHeight
const halfHeight = (height - radius - radius) / 2
const geometry = new PHYSX.PxCapsuleGeometry(radius, halfHeight)

// 地面检测 - PlayerLocal.js:315-390
this.grounded = false
this.groundAngle = 0
this.groundNormal = new THREE.Vector3().copy(UP)
```

## 🎭 动画系统分析

### 📋 现有动画清单

#### 基础表情动画 (playerEmotes.js)
```javascript
export const Emotes = {
  IDLE: 'asset://emote-idle.glb',          // 待机动画
  WALK: 'asset://emote-walk.glb?s=1.5',    // 走路动画 (1.5倍速)
  RUN: 'asset://emote-run.glb?s=1.5',      // 跑步动画 (1.5倍速)
  FLOAT: 'asset://emote-float.glb',        // 漂浮动画
  FALL: 'asset://emote-fall.glb',          // 坠落动画
  FLIP: 'asset://emote-flip.glb?s=1.5',    // 翻转动画 (1.5倍速)
  TALK: 'asset://emote-talk.glb',          // 说话动画
}
```

#### 新发现的动画文件
```
📁 src/world/assets/
├── emote-stand-up.glb    (3.8MB) - 站起动画 ✨新增
├── emote-crouch-down.glb (3.7MB) - 蹲下动画 ✨新增
├── emote-crouch.fbx      (49MB)  - 蹲下姿态 ✨新增
└── ... (其他已有动画)
```

### 🎬 动画状态机

#### 动画优先级系统 (PlayerLocal.js:813-828)
```javascript
let emote
if (this.data.effect?.emote) {
  emote = this.data.effect.emote          // 1. 特效动画（最高优先级）
} else if (this.flying) {
  emote = Emotes.FLOAT                    // 2. 飞行状态
} else if (this.airJumping) {
  emote = Emotes.FLIP                     // 3. 空中跳跃
} else if (this.jumping) {
  emote = Emotes.FLOAT                    // 4. 跳跃状态
} else if (this.falling) {
  emote = this.fallDistance > 1.6 ? Emotes.FALL : Emotes.FLOAT  // 5. 坠落状态
} else if (this.moving) {
  emote = this.running ? Emotes.RUN : Emotes.WALK  // 6. 移动状态
} else if (this.speaking) {
  emote = Emotes.TALK                     // 7. 说话状态
}
if (!emote) emote = Emotes.IDLE          // 8. 默认待机
```

### 🛠️ VRM动画处理机制

#### 动画加载与混合 (createVRMFactory.js:204-248)
```javascript
const setEmote = url => {
  if (currentEmote?.url === url) return
  if (currentEmote) {
    currentEmote.action?.fadeOut(0.15)    // 平滑淡出当前动画
    currentEmote = null
  }
  
  const opts = getQueryParams(url)
  const loop = opts.l !== '0'             // 是否循环播放
  const speed = parseFloat(opts.s || 1)   // 播放速度

  if (emotes[url]) {
    currentEmote = emotes[url]
    if (currentEmote.action) {
      currentEmote.action.clampWhenFinished = !loop
      currentEmote.action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce)
      currentEmote.action.reset().fadeIn(0.15).play()  // 平滑淡入新动画
    }
  }
}
```

## 🚀 扩展新动作动画指南

### 📋 步骤1：添加新动画定义

#### 修改 `src/core/extras/playerEmotes.js`
```javascript
export const Emotes = {
  // 现有动画...
  IDLE: 'asset://emote-idle.glb',
  WALK: 'asset://emote-walk.glb?s=1.5',
  RUN: 'asset://emote-run.glb?s=1.5',
  
  // ✨ 新增动画
  CROUCH: 'asset://emote-crouch-down.glb',     // 蹲下动画
  STAND_UP: 'asset://emote-stand-up.glb',      // 站起动画
  SIT: 'asset://emote-sit.glb',                // 坐下动画
  LIE: 'asset://emote-lie.glb',                // 躺下动画
  GRAB: 'asset://emote-grab.glb',              // 抓取动画
  WAVE: 'asset://emote-wave.glb',              // 挥手动画
  DANCE: 'asset://emote-dance.glb?l=1',        // 跳舞动画（循环）
  CLAP: 'asset://emote-clap.glb?s=1.2',        // 鼓掌动画（1.2倍速）
}

export const emoteUrls = [
  // 现有动画...
  Emotes.IDLE, Emotes.WALK, Emotes.RUN, Emotes.FLOAT, 
  Emotes.FALL, Emotes.FLIP, Emotes.TALK,
  
  // ✨ 新增动画
  Emotes.CROUCH, Emotes.STAND_UP, Emotes.SIT, Emotes.LIE,
  Emotes.GRAB, Emotes.WAVE, Emotes.DANCE, Emotes.CLAP
]
```

### 📋 步骤2：扩展控制状态

#### 修改 `src/core/entities/PlayerLocal.js`
```javascript
// 1. 添加新状态变量 (在init()方法中，约第48行后)
async init() {
  // 现有状态...
  this.moving = false
  this.flying = false
  
  // ✨ 新增状态
  this.crouching = false        // 蹲下状态
  this.sitting = false          // 坐下状态
  this.lying = false            // 躺下状态
  this.grabbing = false         // 抓取状态
  this.dancing = false          // 跳舞状态
  
  // 状态切换时间记录
  this.lastCrouchToggle = 0
  this.lastActionTime = 0
}

// 2. 添加输入控制 (在update()方法中，约第709行后)
update(delta) {
  // 现有输入处理...
  
  // ✨ 新增输入映射
  // Ctrl键：蹲下/站起切换
  if (this.control.ctrlLeft.pressed || this.control.ctrlRight.pressed) {
    this.toggleCrouch()
  }
  
  // Alt键：坐下/站起切换
  if (this.control.altLeft.pressed || this.control.altRight.pressed) {
    this.toggleSit()
  }
  
  // Z键：躺下/站起切换
  if (this.control.keyZ.pressed) {
    this.toggleLie()
  }
  
  // E键：抓取动作
  if (this.control.keyE.pressed) {
    this.performGrab()
  }
  
  // Q键：挥手动作
  if (this.control.keyQ.pressed) {
    this.performWave()
  }
}

// 3. 添加状态切换方法
toggleCrouch() {
  if (this.world.time - this.lastCrouchToggle < 0.5) return // 防止过快切换
  
  if (this.crouching) {
    this.setEffect({ emote: Emotes.STAND_UP, duration: 1.0 }, () => {
      this.crouching = false
    })
  } else {
    this.crouching = true
    this.setEffect({ emote: Emotes.CROUCH, duration: -1 }) // -1表示持续状态
  }
  this.lastCrouchToggle = this.world.time
}

toggleSit() {
  this.sitting = !this.sitting
  if (this.sitting) {
    this.setEffect({ emote: Emotes.SIT, duration: -1 })
  } else {
    this.setEffect(null)
  }
}

toggleLie() {
  this.lying = !this.lying
  if (this.lying) {
    this.setEffect({ emote: Emotes.LIE, duration: -1 })
  } else {
    this.setEffect(null)
  }
}

performGrab() {
  this.setEffect({ emote: Emotes.GRAB, duration: 1.5 })
}

performWave() {
  this.setEffect({ emote: Emotes.WAVE, duration: 2.0 })
}

// 4. 修改动画优先级系统 (约第813行)
// emote
let emote
if (this.data.effect?.emote) {
  emote = this.data.effect.emote          // 特效动画优先级最高
} else if (this.flying) {
  emote = Emotes.FLOAT
} else if (this.lying) {                  // ✨ 躺下状态
  emote = Emotes.LIE
} else if (this.sitting) {                // ✨ 坐下状态
  emote = Emotes.SIT
} else if (this.crouching) {              // ✨ 蹲下状态
  emote = Emotes.CROUCH
} else if (this.airJumping) {
  emote = Emotes.FLIP
} else if (this.jumping) {
  emote = Emotes.FLOAT
} else if (this.falling) {
  emote = this.fallDistance > 1.6 ? Emotes.FALL : Emotes.FLOAT
} else if (this.moving) {
  emote = this.running ? Emotes.RUN : Emotes.WALK
} else if (this.speaking) {
  emote = Emotes.TALK
}
if (!emote) emote = Emotes.IDLE
```

### 📋 步骤3：添加控制器按钮支持

#### 修改 `src/core/systems/ClientControls.js`
```javascript
// 添加新的控制类型 (约第35行)
const controlTypes = {
  // 现有控制...
  mouseLeft: createButton,
  mouseRight: createButton,
  
  // ✨ 新增按键控制
  ctrlLeft: createButton,
  ctrlRight: createButton,
  altLeft: createButton,
  altRight: createButton,
  keyZ: createButton,
  keyE: createButton,
  keyQ: createButton,
}
```

### 📋 步骤4：创建动画文件

#### 动画文件要求
1. **格式**: GLB或FBX格式
2. **骨骼**: 必须与VRM标准骨骼匹配
3. **命名**: 遵循 `emote-动作名.glb` 格式
4. **参数**: 可添加URL参数控制播放
   - `?s=1.5` - 设置播放速度为1.5倍
   - `?l=1` - 设置为循环播放
   - `?l=0` - 设置为单次播放

#### 文件放置位置
```
src/world/assets/
├── emote-crouch.glb        # 蹲下动画
├── emote-sit.glb           # 坐下动画
├── emote-lie.glb           # 躺下动画
├── emote-grab.glb          # 抓取动画
├── emote-wave.glb          # 挥手动画
├── emote-dance.glb         # 跳舞动画
└── emote-clap.glb          # 鼓掌动画
```

### 📋 步骤5：网络同步支持

#### 确保状态同步 (PlayerLocal.js:835-870)
```javascript
// 网络更新已自动包含emote同步
if (this.lastState.e !== this.emote) {
  data.e = this.emote
  this.lastState.e = this.emote
  hasChanges = true
}
if (hasChanges) {
  this.world.network.send('entityModified', data)  // 自动同步到远程玩家
}
```

## 🎯 高级扩展功能

### 🔧 组合动作系统
```javascript
// 创建动作序列
performComplexAction() {
  const sequence = [
    { emote: Emotes.CROUCH, duration: 1.0 },
    { emote: Emotes.GRAB, duration: 1.5 },
    { emote: Emotes.STAND_UP, duration: 1.0 }
  ]
  this.playActionSequence(sequence)
}

playActionSequence(sequence) {
  let index = 0
  const playNext = () => {
    if (index >= sequence.length) return
    const action = sequence[index++]
    this.setEffect({ emote: action.emote, duration: action.duration }, playNext)
  }
  playNext()
}
```

### 🎮 手势控制系统
```javascript
// VR手势识别
detectVRGesture() {
  const leftHand = this.control.xrLeftHand
  const rightHand = this.control.xrRightHand
  
  // 检测挥手手势
  if (leftHand.position.y > this.base.position.y + 1.5) {
    this.performWave()
  }
  
  // 检测抓取手势
  if (leftHand.grip > 0.8 && rightHand.grip > 0.8) {
    this.performGrab()
  }
}
```

### 📱 触屏手势
```javascript
// 双击切换蹲下
onDoubleTap() {
  this.toggleCrouch()
}

// 长按执行特殊动作
onLongPress() {
  this.setEffect({ emote: Emotes.DANCE, duration: -1 })
}
```

## 🛠️ 调试与测试

### 🔍 调试工具
```javascript
// 添加调试信息显示
debug() {
  console.log('Player State:', {
    moving: this.moving,
    running: this.running,
    flying: this.flying,
    crouching: this.crouching,
    sitting: this.sitting,
    lying: this.lying,
    currentEmote: this.emote
  })
}

// 在浏览器控制台中测试
// window.player = this  // 在PlayerLocal.js中添加
// player.toggleCrouch() // 在控制台中调用
```

### ⚡ 性能优化
```javascript
// 动画距离优化 (createVRMFactory.js已实现)
const DIST_CHECK_RATE = 1.0     // 距离检查频率
const DIST_MIN = 5              // 最小距离
const DIST_MAX = 20             // 最大距离
const DIST_MIN_RATE = 1/60      // 近距离更新率
const DIST_MAX_RATE = 1/10      // 远距离更新率
```

## 📊 完整功能清单

### ✅ 现有功能
- ✅ 基础移动（WASD）
- ✅ 奔跑（Shift）
- ✅ 跳跃/二段跳（Space）
- ✅ 飞行模式（双击Space）
- ✅ VR控制器支持
- ✅ 触屏摇杆支持
- ✅ 基础动画系统（走路、跑步、跳跃、漂浮、坠落、说话）
- ✅ 物理碰撞检测
- ✅ 网络同步

### 🚀 扩展功能建议
- 🔲 蹲下动作（Ctrl键）
- 🔲 坐下动作（Alt键）  
- 🔲 躺下动作（Z键）
- 🔲 抓取动作（E键）
- 🔲 挥手动作（Q键）
- 🔲 跳舞动作（组合键）
- 🔲 鼓掌动作
- 🔲 手势识别系统
- 🔲 动作序列播放
- 🔲 表情动画编辑器
- 🔲 自定义动画上传

## 📋 注意事项

### ⚠️ 重要提醒
1. **动画文件格式**: 必须使用VRM兼容的GLB文件
2. **骨骼匹配**: 动画骨骼必须与VRM标准一致
3. **性能考虑**: 复杂动画会影响渲染性能
4. **网络带宽**: 频繁的动画切换会增加网络流量
5. **兼容性**: 确保所有平台（PC、移动端、VR）都能正常播放

### 🔧 开发建议
1. **渐进式开发**: 先实现单个动作，再扩展到复杂系统
2. **用户测试**: 重点测试VR和移动端的体验
3. **性能监控**: 使用内置的统计系统监控帧率
4. **动画预加载**: 确保常用动画提前加载
5. **状态管理**: 避免状态冲突和意外的动画切换

---

**文档版本**: v1.0  
**更新时间**: 2025年1月8日  
**适用版本**: Hyperfy v0.13.0+ 