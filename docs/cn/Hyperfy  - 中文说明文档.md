# Hyperfy ⚡️ - 中文说明文档

<div align="center">
  <img src="overview.png" alt="Hyperfy 生态系统" width="100%" />
  <p>
    <strong>构建、部署和体验交互式3D虚拟世界</strong>
  </p>
</div>

## 🌟 项目概述

Hyperfy 是一个开源的交互式3D虚拟世界构建框架。它结合了强大的物理引擎、网络化实时协作和基于组件的应用系统，创造出可以自托管或连接到更广泛的 Hyperfy 生态系统的沉浸式体验。

## 🏗️ 核心架构

Hyperfy 采用模块化架构设计，分为以下几个主要部分：

### 客户端-服务器架构
- **服务端**：基于 Fastify 的高性能 Node.js 服务器
- **客户端**：基于 Three.js 的 WebGL 渲染引擎
- **实时通信**：WebSocket 连接支持多用户协作
- **物理引擎**：集成 PhysX 提供真实的物理模拟

### 组件系统
- **节点系统**：基于组件的场景图架构
- **实体系统**：灵活的游戏对象管理
- **应用系统**：JavaScript 驱动的交互式应用

## 📁 项目目录结构

```
hyperfy/
├── 📁 src/                          # 源代码目录
│   ├── 📁 client/                   # 客户端代码
│   │   ├── 📁 components/           # React UI 组件
│   │   │   ├── CoreUI.js           # 核心用户界面
│   │   │   ├── Menu.js             # 主菜单系统
│   │   │   ├── Sidebar.js          # 侧边栏组件
│   │   │   ├── CodeEditor.js       # 代码编辑器
│   │   │   ├── InspectPane.js      # 属性检查面板
│   │   │   └── ...                 # 其他UI组件
│   │   ├── 📁 public/              # 静态资源
│   │   ├── world-client.js         # 世界客户端逻辑
│   │   ├── particles.js            # 粒子系统
│   │   ├── AvatarPreview.js        # 头像预览
│   │   └── index.js                # 客户端入口
│   │
│   ├── 📁 server/                   # 服务器端代码
│   │   ├── index.js                # 服务器主文件
│   │   ├── db.js                   # 数据库操作
│   │   ├── collections.js          # 集合管理
│   │   ├── Storage.js              # 存储系统
│   │   └── bootstrap.js            # 启动配置
│   │
│   ├── 📁 core/                     # 核心系统
│   │   ├── 📁 systems/              # 系统模块
│   │   │   ├── Physics.js          # 物理系统
│   │   │   ├── ClientNetwork.js    # 客户端网络
│   │   │   ├── ServerNetwork.js    # 服务端网络
│   │   │   ├── ClientControls.js   # 客户端控制
│   │   │   ├── ClientBuilder.js    # 构建模式
│   │   │   ├── ClientGraphics.js   # 图形渲染
│   │   │   ├── ClientAudio.js      # 音频系统
│   │   │   ├── ClientLiveKit.js    # 实时通信
│   │   │   ├── XR.js               # VR/AR 支持
│   │   │   ├── Apps.js             # 应用系统
│   │   │   ├── Entities.js         # 实体管理
│   │   │   ├── Stage.js            # 场景管理
│   │   │   └── ...                 # 其他系统
│   │   │
│   │   ├── 📁 nodes/                # 节点组件
│   │   │   ├── Node.js             # 基础节点
│   │   │   ├── Mesh.js             # 网格节点
│   │   │   ├── RigidBody.js        # 刚体节点
│   │   │   ├── Collider.js         # 碰撞器节点
│   │   │   ├── Audio.js            # 音频节点
│   │   │   ├── Video.js            # 视频节点
│   │   │   ├── Particles.js        # 粒子节点
│   │   │   ├── UI.js               # 用户界面节点
│   │   │   ├── UIText.js           # 文本节点
│   │   │   ├── UIImage.js          # 图像节点
│   │   │   ├── Avatar.js           # 头像节点
│   │   │   ├── Controller.js       # 控制器节点
│   │   │   ├── Action.js           # 动作节点
│   │   │   ├── Sky.js              # 天空节点
│   │   │   └── ...                 # 其他节点类型
│   │   │
│   │   ├── 📁 entities/             # 实体类型
│   │   │   ├── Entity.js           # 基础实体
│   │   │   ├── PlayerLocal.js      # 本地玩家
│   │   │   ├── PlayerRemote.js     # 远程玩家
│   │   │   └── App.js              # 应用实体
│   │   │
│   │   ├── 📁 libs/                 # 第三方库
│   │   ├── 📁 extras/               # 扩展功能
│   │   ├── World.js                # 世界核心类
│   │   ├── Socket.js               # WebSocket 封装
│   │   ├── storage.js              # 存储接口
│   │   ├── utils.js                # 通用工具
│   │   ├── packets.js              # 网络包定义
│   │   ├── loadPhysX.js            # 物理引擎加载
│   │   ├── createClientWorld.js    # 客户端世界创建
│   │   ├── createServerWorld.js    # 服务端世界创建
│   │   ├── createViewerWorld.js    # 查看器世界创建
│   │   └── createNodeClientWorld.js # Node客户端世界创建
│   │
│   ├── 📁 node-client/              # Node.js 客户端
│   └── 📁 world/                    # 世界模板
│       ├── 📁 assets/               # 资源文件
│       └── 📁 collections/          # 集合数据
│
├── 📁 world/                        # 运行时世界数据
│   ├── 📁 assets/                   # 世界资源
│   ├── 📁 collections/              # 世界集合
│   └── db.sqlite                   # 世界数据库
│
├── 📁 scripts/                      # 构建脚本
│   ├── build.mjs                   # 主构建脚本
│   ├── build-client.mjs            # 客户端构建
│   ├── build-viewer.mjs            # 查看器构建
│   ├── build-node-client.mjs       # Node客户端构建
│   └── clean-world.mjs             # 世界清理脚本
│
├── 📁 docs/                         # 文档目录
│   ├── 📁 ref/                     # 参考文档
│   ├── README.md                   # 文档说明
│   ├── scripts.md                  # 脚本文档
│   ├── commands.md                 # 命令文档
│   ├── models.md                   # 模型文档
│   ├── hyp-format.md               # HYP格式文档
│   ├── blender-exporter.md         # Blender导出文档
│   └── blender-addon.py            # Blender插件
│
├── 📁 build/                        # 构建输出目录
├── 📁 node_modules/                 # Node.js 依赖
├── 📁 .vscode/                      # VS Code 配置
├── 📁 .github/                      # GitHub 配置
│
├── 📄 package.json                  # 项目配置文件
├── 📄 package-lock.json             # 依赖锁定文件
├── 📄 .env.example                  # 环境变量示例
├── 📄 .nvmrc                        # Node.js 版本文件
├── 📄 .gitignore                    # Git 忽略文件
├── 📄 .eslintrc                     # ESLint 配置
├── 📄 .prettierrc                   # Prettier 配置
├── 📄 .dockerignore                 # Docker 忽略文件
├── 📄 Dockerfile                    # Docker 配置
├── 📄 DOCKER.md                     # Docker 说明
├── 📄 README.md                     # 英文说明文档
├── 📄 README_CN.md                  # 中文说明文档（本文件）
├── 📄 CHANGELOG.md                  # 版本更新日志
├── 📄 CONTRIBUTING.md               # 贡献指南
├── 📄 CODE_OF_CONDUCT.md            # 行为准则
├── 📄 LICENSE                       # 开源许可证
├── 📄 ISSUE_TEMPLATE.md             # 问题报告模板
├── 📄 PULL_REQUEST_TEMPLATE.md      # PR 模板
├── 📄 agent.mjs                     # 代理脚本
└── 📄 overview.png                  # 项目概览图
```

## 🧬 核心功能特性

### 🌍 世界系统
- **独立持久化世界** - 在您自己的域名上托管
- **实时内容创建** - 直接在世界中构建
- **多用户协作** - 支持多人同时编辑
- **世界状态同步** - 自动保存和同步世界状态

### 🎮 交互系统
- **交互式应用系统** - 使用 JavaScript 创建动态应用
- **组件化架构** - 灵活的节点组件系统
- **事件驱动** - 完整的事件系统支持
- **实时脚本编辑** - 在线编辑和热重载

### 👤 用户系统
- **便携式头像** - 通过 Hyperfy 连接获得一致的身份
- **语音聊天** - 内置空间音频和语音聊天
- **用户权限** - 管理员权限和访问控制
- **玩家限制** - 可配置的世界玩家数量限制

### 🎨 渲染系统
- **基于物理的渲染** - 真实感渲染效果
- **后处理效果** - 丰富的视觉效果
- **动态阴影** - 实时阴影系统
- **粒子系统** - 高性能粒子效果
- **LOD 系统** - 自动细节层次优化

### 🔧 物理系统
- **基于 PhysX 的交互** - 真实的物理模拟
- **刚体物理** - 完整的刚体动力学
- **碰撞检测** - 精确的碰撞系统
- **关节约束** - 物理关节和约束
- **射线检测** - 射线投射查询

### 🥽 扩展现实支持
- **WebXR 支持** - 在 VR 中体验世界
- **VR 控制器** - 完整的 VR 交互支持
- **空间追踪** - 6DOF 头部和手部追踪
- **沉浸式界面** - VR 优化的用户界面

### 📱 跨平台支持
- **桌面浏览器** - 完整的桌面体验
- **移动设备** - 优化的移动端界面
- **VR 头显** - Meta Quest、HTC Vive 等支持
- **触屏控制** - 移动设备触摸优化

## 🛠️ 技术栈

### 前端技术
- **Three.js** - 3D 图形渲染引擎
- **React** - 用户界面框架
- **WebGL** - 硬件加速图形
- **WebXR** - 虚拟现实支持
- **WebRTC** - 实时通信

### 后端技术
- **Node.js** - 服务器运行时
- **Fastify** - 高性能 Web 框架
- **SQLite** - 轻量级数据库
- **WebSocket** - 实时通信
- **PhysX** - 物理引擎

### 开发工具
- **ESBuild** - 快速构建工具
- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **Docker** - 容器化部署

## 🚀 快速开始

### 系统要求

- **Node.js** 22.11.0+ (推荐使用 [nvm](https://github.com/nvm-sh/nvm))
- **npm** 10.0.0+
- **现代浏览器** (支持 WebGL 2.0)

### 安装步骤

1. **克隆仓库**
```bash
git clone https://github.com/hyperfy-xyz/hyperfy.git my-world
cd my-world
```

2. **配置环境变量**
```bash
cp .env.example .env
```

3. **安装依赖**
```bash
npm install
```

4. **启动开发服务器**
```bash
npm run dev
```

服务器将在 `http://localhost:3000` 启动。

### Docker 部署

1. **构建和运行容器**
```bash
docker build -t hyperfy-world .
docker run -d -p 3000:3000 \
  -v "$(pwd)/src:/app/src" \
  -v "$(pwd)/world:/app/world" \
  -v "$(pwd)/.env:/app/.env" \
  -e DOMAIN=your-domain.com \
  -e PORT=3000 \
  hyperfy-world
```

## 📋 可用脚本

### 开发脚本
```bash
# 开发模式（热重载）
npm run dev

# 生产构建
npm run build

# 启动生产服务器
npm start
```

### 专用构建
```bash
# 仅构建查看器
npm run viewer:dev      # 开发模式
npm run viewer:build    # 生产构建

# 仅构建客户端
npm run client:dev      # 开发模式
npm run client:build    # 生产构建

# Node.js 客户端
npm run node-client:dev    # 开发模式
npm run node-client:build # 生产构建
```

### 维护脚本
```bash
# 清理孤立资源（实验性）
npm run world:clean

# 代码检查和格式化
npm run lint           # 检查代码规范
npm run lint:fix       # 自动修复问题
npm run format         # 格式化代码
npm run check          # 完整检查
```

## 🎯 使用场景

### 🎪 虚拟活动和会议
- 举办现场聚会，支持空间音频
- 多人协作和演示
- 实时互动和问答

### 🏪 交互式展示厅
- 产品展示和演示
- 虚拟展览和画廊
- 沉浸式购物体验

### 🏠 社交空间
- 建立社区协作中心
- 虚拟聚会场所
- 团队协作环境

### 🎮 游戏环境
- 设计沉浸式游戏世界
- 多人在线游戏
- 交互式娱乐体验

### 📚 教育体验
- 开发交互式学习空间
- 虚拟实验室和课堂
- 沉浸式教育内容

### 🎨 创意展示
- 展示 3D 艺术和交互装置
- 虚拟美术馆
- 创意作品集展示

## 💡 应用开发

### 基础应用结构
```javascript
/**
 * 示例 Hyperfy 应用
 */
export default function MyApp(props) {
  const { position, color } = props
  
  // 应用状态
  const [count, setCount] = useState(0)
  
  // 生命周期
  useEffect(() => {
    console.log('应用已加载')
    
    return () => {
      console.log('应用已卸载')
    }
  }, [])
  
  // 交互处理
  const handleClick = () => {
    setCount(count + 1)
    app.playSound('click.mp3')
  }
  
  return (
    <group position={position}>
      <mesh onClick={handleClick}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      <ui position={[0, 1.5, 0]}>
        <text>点击次数: {count}</text>
      </ui>
    </group>
  )
}

// 应用属性定义
MyApp.props = {
  position: { type: 'vec3', default: [0, 0, 0] },
  color: { type: 'color', default: '#ff0000' }
}
```

### 网络同步
```javascript
// 服务器端逻辑
export function server({ room, app }) {
  let sharedState = { score: 0 }
  
  // 监听客户端事件
  app.on('updateScore', (playerId, delta) => {
    sharedState.score += delta
    // 广播状态更新
    room.broadcast('scoreUpdated', sharedState.score)
  })
  
  // 新玩家加入时同步状态
  app.on('playerJoin', (playerId) => {
    app.sendTo(playerId, 'scoreUpdated', sharedState.score)
  })
}
```

## 🔧 配置选项

### 环境变量
```bash
# 基础配置
DOMAIN=localhost
PORT=3000
NODE_ENV=development

# 资源配置
ASSETS_DIR=./world/assets
PUBLIC_ASSETS_URL=http://localhost:3000/assets

# API 配置
PUBLIC_API_URL=http://localhost:3000/api
PUBLIC_WS_URL=ws://localhost:3000/ws

# 数据库配置
DB_PATH=./world/db.sqlite

# LiveKit 配置（语音聊天）
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
LIVEKIT_WS_URL=wss://your-livekit-server.com

# 管理员配置
ADMIN_KEY=your_admin_key
```

### 世界配置
```javascript
// world/config.json
{
  "name": "我的世界",
  "description": "一个令人惊叹的虚拟世界",
  "maxPlayers": 50,
  "spawnPoint": [0, 1, 0],
  "environment": {
    "sky": "sunset",
    "fog": {
      "enabled": true,
      "color": "#87CEEB",
      "density": 0.01
    },
    "lighting": {
      "ambient": "#404040",
      "directional": "#ffffff"
    }
  },
  "physics": {
    "gravity": [0, -9.81, 0],
    "timeStep": 1/60
  }
}
```

## 🔌 扩展和插件

### 自定义节点组件
```javascript
// 创建自定义节点
export default class CustomNode extends Node {
  static type = 'CustomNode'
  
  constructor(world, data) {
    super(world, data)
    this.setupCustomBehavior()
  }
  
  setupCustomBehavior() {
    // 自定义节点逻辑
  }
  
  onUpdate(dt) {
    // 每帧更新逻辑
  }
  
  onDestroy() {
    // 清理逻辑
  }
}
```

### 系统扩展
```javascript
// 创建自定义系统
export default class CustomSystem extends System {
  static id = 'CustomSystem'
  
  init() {
    // 系统初始化
  }
  
  tick(dt) {
    // 系统更新循环
  }
  
  destroy() {
    // 系统清理
  }
}
```

## 🐛 调试和性能

### 开发者工具
- **统计面板** - 显示 FPS、内存使用等
- **网络监控** - 监控网络包和延迟
- **物理调试** - 可视化碰撞体和约束
- **性能分析** - 分析渲染和更新性能

### 性能优化
- **LOD 系统** - 根据距离调整细节级别
- **八叉树** - 空间分割优化
- **实例化** - 减少绘制调用
- **纹理压缩** - 优化内存使用

## 📚 文档和资源

- **[社区文档](https://hyperfy.how)** - 详细指南和参考
- **[官方网站](https://hyperfy.io/)** - Hyperfy 官方网站
- **[在线演示](https://play.hyperfy.xyz/)** - 在浏览器中试用 Hyperfy
- **[Twitter/X](https://x.com/hyperfy_io)** - 最新更新和公告
- **[GitHub Issues](https://github.com/hyperfy-xyz/hyperfy/issues)** - 问题报告和功能请求

## 🤝 贡献指南

我们欢迎社区贡献！请查看我们的[贡献指南](CONTRIBUTING.md)和[行为准则](CODE_OF_CONDUCT.md)。

### 贡献流程
1. Fork 仓库
2. 创建功能分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 打开 Pull Request

### 开发规范
- 遵循现有代码风格
- 编写清晰的提交信息
- 添加必要的测试
- 更新相关文档

## 📈 项目状态

这个项目目前处于 **Alpha 阶段**，我们正在将所有[参考平台](https://github.com/hyperfy-xyz/hyperfy-ref)代码转换为完全可自托管的世界。

大部分功能已经在这个仓库中，但仍需要连接起来以支持自托管。请注意，在此期间 API 很可能会发生变化。

### 当前版本
- **版本**：v0.12.0
- **许可证**：GPL-3.0-only
- **Node.js**：22.11.0
- **状态**：Active Development

## 🔄 版本历史

### v0.12.0 (最新)
- 添加了应用禁用切换
- 新增缩放小工具和 UI v3
- 实验性应用集合支持
- Node.js 客户端环境支持
- 简单的 Blender 插件

### v0.11.0
- 语音聊天和表情系统
- 改进的移动端 UI
- 骨骼网格和动画支持
- 视频节点和屏幕共享
- 粒子系统增强

### v0.10.0
- 全新简化的用户界面
- 世界菜单系统
- 精细化构建控制
- 控制器支持和几何处理
- 插件系统（实验性）

查看完整的[更新日志](CHANGELOG.md)了解所有版本变化。

## 🆘 支持和帮助

### 常见问题

**Q: 如何部署到生产环境？**
A: 参考 [DOCKER.md](DOCKER.md) 了解 Docker 部署，或使用 `npm run build && npm start` 进行传统部署。

**Q: 如何自定义世界环境？**
A: 在构建模式下使用世界菜单，或直接编辑世界配置文件。

**Q: 支持哪些 3D 模型格式？**
A: 主要支持 glTF/GLB 格式，也支持其他常见的 Three.js 兼容格式。

**Q: 如何启用语音聊天？**
A: 配置 LiveKit 服务器并设置相应的环境变量。

### 获取帮助
- 在 [GitHub Issues](https://github.com/hyperfy-xyz/hyperfy/issues) 报告问题
- 查看[社区文档](https://hyperfy.how)获取详细指南
- 关注 [Twitter/X](https://x.com/hyperfy_io) 获取最新消息

## 📄 许可证

本项目基于 [GNU General Public License v3.0](LICENSE) 开源许可证。

---

<div align="center">
  <p>
    <strong>开始构建您的虚拟世界吧！🚀</strong>
  </p>
  <p>
    如果这个项目对您有帮助，请给我们一个 ⭐️
  </p>
</div> 