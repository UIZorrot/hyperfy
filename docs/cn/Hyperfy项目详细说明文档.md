# Hyperfy 虚拟世界项目详细说明文档

## 🌟 项目概述

**Hyperfy** 是一个开源的3D虚拟世界构建框架，用于创建交互式、实时协作的元宇宙体验。该项目结合了强大的物理引擎、网络化实时协作和基于组件的应用系统，可以自托管或连接到更广泛的Hyperfy生态系统。

### 核心特性
- ⚡ **独立持久世界** - 在自己的域名上托管
- 🎨 **实时内容创建** - 直接在世界中构建
- 🔧 **交互式应用系统** - 使用JavaScript创建动态应用
- 👤 **便携式化身** - 通过Hyperfy连接保持身份一致性
- 🎯 **基于物理的交互** - 基于PhysX引擎进行真实模拟
- 🥽 **WebXR支持** - 在VR中体验世界
- 🔄 **可扩展架构** - 高度可定制化

## 📁 项目目录结构

```
D:\hyperfy-main
├── 📋 配置文件
│   ├── package.json                 # 项目配置和依赖管理 (2.5KB, 91行)
│   ├── package-lock.json           # NPM依赖锁定文件 (276KB, 7813行)
│   ├── .gitignore                  # Git忽略文件配置 (95B, 9行)
│   ├── .npmrc                      # NPM配置 (14B, 1行)
│   ├── .nvmrc                      # Node.js版本配置 (7B, 1行)
│   ├── .eslintrc                   # ESLint代码检查配置 (1.2KB, 55行)
│   ├── .eslintignore               # ESLint忽略文件 (29B, 4行)
│   ├── .prettierrc                 # Prettier格式化配置 (142B, 9行)
│   ├── .prettierignore             # Prettier忽略文件 (37B, 3行)
│   ├── .dockerignore               # Docker忽略文件 (111B, 11行)
│   ├── Dockerfile                  # Docker镜像构建文件 (1.0KB, 42行)
│   ├── agent.mjs                   # 智能代理脚本 (1.3KB, 70行)
│   ├── README.md                   # 项目说明文档 (3.6KB, 119行)
│   ├── CHANGELOG.md                # 项目更新日志 (16KB, 431行)
│   ├── LICENSE                     # GPL-3.0开源许可证 (34KB, 675行)
│   ├── CONTRIBUTING.md             # 贡献指南 (3.8KB, 127行)
│   ├── CODE_OF_CONDUCT.md          # 行为准则 (5.0KB, 72行)
│   ├── DOCKER.md                   # Docker部署说明 (890B, 28行)
│   ├── ISSUE_TEMPLATE.md           # 问题报告模板 (885B, 35行)
│   ├── PULL_REQUEST_TEMPLATE.md    # PR模板 (1.1KB, 40行)
│   └── overview.png                # 项目概览图 (216KB)
│
├── 📚 文档目录 (docs/)
│   ├── README.md                   # 文档首页 (256B, 7行)
│   ├── blender-addon.py           # Blender插件脚本 (34KB, 877行)
│   ├── blender-exporter.md        # Blender导出器说明 (1.6KB, 50行)
│   ├── commands.md                # 命令行指令文档 (776B, 26行)
│   ├── hyp-format.md             # HYP格式说明 (2.6KB, 106行)
│   ├── models.md                 # 3D模型文档 (1.1KB, 28行)
│   ├── scripts.md                # 脚本文档 (1.8KB, 45行)
│   └── ref/                      # API参考文档目录
│       ├── Action.md              # 动作组件API (902B, 35行)
│       ├── Anchor.md              # 锚点组件API (522B, 22行)
│       ├── App.md                 # 应用组件API (2.4KB, 67行)
│       ├── Audio.md               # 音频组件API (1.9KB, 84行)
│       ├── Avatar.md              # 头像组件API (1.3KB, 50行)
│       ├── Collider.md            # 碰撞器组件API (1.2KB, 39行)
│       ├── Controller.md          # 控制器组件API (1.4KB, 54行)
│       ├── Group.md               # 组组件API (191B, 11行)
│       ├── Image.md               # 图像组件API (1.7KB, 59行)
│       ├── LOD.md                 # 细节层次组件API (708B, 26行)
│       ├── Material.md            # 材质组件API (570B, 21行)
│       ├── Mesh.md                # 网格组件API (511B, 22行)
│       ├── Node.md                # 节点组件API (1.2KB, 59行)
│       ├── Particles.md           # 粒子组件API (7.6KB, 254行)
│       ├── Player.md              # 玩家组件API (2.3KB, 83行)
│       ├── Props.md               # 属性组件API (4.2KB, 169行)
│       ├── RigidBody.md           # 刚体组件API (963B, 35行)
│       ├── SkinnedMesh.md         # 蒙皮网格组件API (1.2KB, 46行)
│       ├── UI.md                  # UI组件API (3.9KB, 148行)
│       ├── UIImage.md             # UI图像组件API (3.5KB, 160行)
│       ├── UIText.md              # UI文本组件API (1.1KB, 73行)
│       ├── UIView.md              # UI视图组件API (1.7KB, 98行)
│       ├── Video.md               # 视频组件API (5.2KB, 144行)
│       ├── World.md               # 世界组件API (1.4KB, 57行)
│       └── num.md                 # 数值工具API (324B, 15行)
│
├── 🛠️ 构建脚本 (scripts/)
│   ├── build.mjs                  # 主构建脚本 (4.4KB, 144行)
│   ├── build-client.mjs           # 客户端构建脚本 (1.2KB, 53行)
│   ├── build-node-client.mjs      # Node客户端构建脚本 (2.0KB, 70行)
│   ├── build-viewer.mjs           # 查看器构建脚本 (1.3KB, 54行)
│   └── clean-world.mjs            # 世界清理脚本 (4.5KB, 154行)
│
├── 🌍 源代码目录 (src/)
│   ├── 🖥️ 客户端 (client/)
│   │   ├── AvatarPreview.js       # 头像预览组件 (11KB, 402行)
│   │   ├── index.js               # 客户端入口 (271B, 13行)
│   │   ├── particles.js           # 粒子系统 (35KB, 1069行)
│   │   ├── utils.js               # 客户端工具函数 (721B, 23行)
│   │   ├── world-client.js        # 世界客户端 (2.0KB, 79行)
│   │   ├── components/            # 客户端UI组件
│   │   │   ├── 🎨 界面核心组件
│   │   │   │   ├── CoreUI.js                  # 核心UI组件 (31KB, 1123行)
│   │   │   │   ├── Sidebar.js                 # 侧边栏组件 (48KB, 1628行)
│   │   │   │   ├── Menu.js                    # 主菜单组件 (25KB, 957行)
│   │   │   │   ├── MenuMain.js                # 主菜单界面 (10KB, 329行)
│   │   │   │   ├── MenuApp.js                 # 应用菜单 (10KB, 352行)
│   │   │   │   ├── SettingsPane.js            # 设置面板 (9.3KB, 303行)
│   │   │   │   └── InspectPane.js             # 检查面板 (27KB, 983行)
│   │   │   ├── 📝 应用与编辑器
│   │   │   │   ├── AppsPane.js                # 应用面板 (12KB, 424行)
│   │   │   │   ├── AppsList.js                # 应用列表 (10KB, 361行)
│   │   │   │   ├── ScriptEditor.js            # 脚本编辑器 (12KB, 517行)
│   │   │   │   └── CodeEditor.js              # 代码编辑器 (21KB, 827行)
│   │   │   ├── 👤 用户系统
│   │   │   │   └── AvatarPane.js              # 头像面板 (3.3KB, 121行)
│   │   │   ├── 🎨 曲线编辑器
│   │   │   │   ├── CurvePane.js               # 曲线编辑面板 (3.0KB, 114行)
│   │   │   │   └── CurvePreview.js            # 曲线预览 (1.4KB, 53行)
│   │   │   ├── 🛠️ 工具组件
│   │   │   │   ├── Fields.js                  # 字段组件 (28KB, 1039行)
│   │   │   │   ├── Inputs.js                  # 输入组件 (12KB, 517行)
│   │   │   │   ├── Icons.js                   # 图标组件 (7.7KB, 126行)
│   │   │   │   ├── Portal.js                  # 传送门组件 (158B, 6行)
│   │   │   │   ├── Hint.js                    # 提示组件 (351B, 12行)
│   │   │   │   ├── NodeHierarchy.js           # 节点层次结构 (6.5KB, 230行)
│   │   │   │   ├── MouseLeftIcon.js           # 鼠标左键图标 (546B, 15行)
│   │   │   │   ├── MouseRightIcon.js          # 鼠标右键图标 (550B, 15行)
│   │   │   │   ├── MouseWheelIcon.js          # 鼠标滚轮图标 (551B, 15行)
│   │   │   │   └── cls.js                     # CSS类工具 (305B, 15行)
│   │   │   └── 🔧 React钩子
│   │   │       ├── usePermissions.js          # 权限钩子 (693B, 23行)
│   │   │       ├── useUpdate.js               # 更新钩子 (130B, 7行)
│   │   │       ├── useElemSize.js             # 元素尺寸钩子 (607B, 23行)
│   │   │       ├── useFullscreen.js           # 全屏钩子 (1.9KB, 68行)
│   │   │       └── usePane.js                 # 面板钩子 (2.8KB, 112行)
│   │   └── public/                # 客户端公共资源
│   │       ├── index.html                     # 主页面 (1.4KB, 40行)
│   │       ├── index.css                      # 样式文件 (2.4KB, 191行)
│   │       ├── base-environment.glb           # 基础环境模型 (1.4MB)
│   │       ├── day2.hdr                       # HDR日间环境贴图 (97KB, 179行)
│   │       ├── day2-2k.jpg                    # 日间环境贴图JPG (150KB, 463行)
│   │       ├── dusk3.hdr                      # HDR黄昏环境贴图 (294KB, 391行)
│   │       ├── particle.png                   # 粒子贴图 (19KB, 104行)
│   │       ├── rubik.woff2                    # Rubik字体文件 (34KB, 136行)
│   │       └── tiny.mp4                       # 测试视频文件 (3.2KB, 12行)
│   │
│   ├── ⚙️ 核心系统 (core/)
│   │   ├── 🎯 世界创建器
│   │   │   ├── createClientWorld.js     # 创建客户端世界 (2.0KB, 50行)
│   │   │   ├── createNodeClientWorld.js # 创建Node客户端世界 (984B, 24行)
│   │   │   ├── createServerWorld.js     # 创建服务器世界 (701B, 20行)
│   │   │   └── createViewerWorld.js     # 创建查看器世界 (841B, 24行)
│   │   │
│   │   ├── 🎮 实体系统 (entities/)
│   │   │   ├── App.js              # 应用实体 (14KB, 506行)
│   │   │   ├── Entity.js           # 基础实体类 (490B, 29行)
│   │   │   ├── PlayerLocal.js      # 本地玩家实体 (36KB, 1047行)
│   │   │   └── PlayerRemote.js     # 远程玩家实体 (6.2KB, 227行)
│   │   │
│   │   ├── 🎨 节点组件 (nodes/)
│   │   │   ├── index.js            # 节点系统入口 (1.0KB, 27行)
│   │   │   ├── 🎬 基础节点
│   │   │   │   ├── Node.js         # 基础节点类 (12KB, 502行)
│   │   │   │   ├── Group.js        # 组节点 (484B, 25行)
│   │   │   │   ├── Action.js       # 动作节点 (3.5KB, 167行)
│   │   │   │   ├── Anchor.js       # 锚点节点 (779B, 37行)
│   │   │   │   └── Snap.js         # 吸附节点 (943B, 44行)
│   │   │   ├── 🎨 渲染节点
│   │   │   │   ├── Mesh.js         # 网格节点 (9.5KB, 412行)
│   │   │   │   ├── SkinnedMesh.js  # 蒙皮网格节点 (6.5KB, 271行)
│   │   │   │   ├── Image.js        # 图像节点 (14KB, 531行)
│   │   │   │   ├── Video.js        # 视频节点 (29KB, 1166行)
│   │   │   │   ├── Sky.js          # 天空节点 (5.0KB, 229行)
│   │   │   │   ├── Particles.js    # 粒子节点 (21KB, 901行)
│   │   │   │   └── LOD.js          # 细节层次节点 (2.8KB, 117行)
│   │   │   ├── 🎵 媒体节点
│   │   │   │   └── Audio.js        # 音频节点 (13KB, 514行)
│   │   │   ├── 🔧 物理节点
│   │   │   │   ├── Collider.js     # 碰撞器节点 (11KB, 455行)
│   │   │   │   ├── RigidBody.js    # 刚体节点 (15KB, 556行)
│   │   │   │   └── Joint.js        # 关节节点 (11KB, 335行)
│   │   │   ├── 🎮 交互节点
│   │   │   │   ├── Controller.js   # 控制器节点 (8.8KB, 333行)
│   │   │   │   └── Avatar.js       # 头像节点 (4.0KB, 193行)
│   │   │   ├── 📋 UI节点
│   │   │   │   ├── UI.js           # UI节点 (30KB, 1111行)
│   │   │   │   ├── UIView.js       # UI视图节点 (20KB, 700行)
│   │   │   │   ├── UIText.js       # UI文本节点 (19KB, 691行)
│   │   │   │   ├── UIImage.js      # UI图像节点 (15KB, 553行)
│   │   │   │   └── Nametag.js      # 名牌节点 (1.9KB, 94行)
│   │   │
│   │   ├── 🖥️ 系统管理 (systems/)
│   │   │   ├── 🎯 客户端系统
│   │   │   │   ├── Client.js               # 客户端主系统 (2.6KB, 94行)
│   │   │   │   ├── ClientActions.js        # 客户端动作系统 (11KB, 362行)
│   │   │   │   ├── ClientAudio.js          # 客户端音频系统 (4.5KB, 145行)
│   │   │   │   ├── ClientBuilder.js        # 客户端构建系统 (30KB, 958行)
│   │   │   │   ├── ClientControls.js       # 客户端控制系统 (22KB, 767行)
│   │   │   │   ├── ClientEnvironment.js    # 客户端环境系统 (7.3KB, 269行)
│   │   │   │   ├── ClientGraphics.js       # 客户端图形系统 (6.2KB, 211行)
│   │   │   │   ├── ClientLiveKit.js        # 客户端LiveKit系统 (13KB, 419行)
│   │   │   │   ├── ClientLoader.js         # 客户端加载系统 (15KB, 538行)
│   │   │   │   ├── ClientNetwork.js        # 客户端网络系统 (6.0KB, 231行)
│   │   │   │   ├── ClientPointer.js        # 客户端指针系统 (4.2KB, 175行)
│   │   │   │   ├── ClientPrefs.js          # 客户端偏好设置系统 (2.9KB, 128行)
│   │   │   │   ├── ClientStats.js          # 客户端统计系统 (3.8KB, 160行)
│   │   │   │   ├── ClientTarget.js         # 客户端目标系统 (4.5KB, 190行)
│   │   │   │   └── ClientUI.js             # 客户端UI系统 (2.3KB, 104行)
│   │   │   │
│   │   │   ├── 🖥️ 服务器系统
│   │   │   │   ├── Server.js               # 服务器主系统 (460B, 32行)
│   │   │   │   ├── ServerEnvironment.js    # 服务器环境系统 (771B, 36行)
│   │   │   │   ├── ServerLiveKit.js        # 服务器LiveKit系统 (1.0KB, 37行)
│   │   │   │   ├── ServerLoader.js         # 服务器加载系统 (5.2KB, 195行)
│   │   │   │   ├── ServerMonitor.js        # 服务器监控系统 (631B, 23行)
│   │   │   │   └── ServerNetwork.js        # 服务器网络系统 (16KB, 547行)
│   │   │   │
│   │   │   ├── 🌐 通用系统
│   │   │   │   ├── System.js               # 系统基类 (1.9KB, 87行)
│   │   │   │   ├── Anchors.js              # 锚点系统 (487B, 32行)
│   │   │   │   ├── Apps.js                 # 应用系统 (11KB, 357行)
│   │   │   │   ├── Blueprints.js           # 蓝图系统 (1.2KB, 64行)
│   │   │   │   ├── Chat.js                 # 聊天系统 (2.4KB, 112行)
│   │   │   │   ├── Collections.js          # 集合系统 (372B, 25行)
│   │   │   │   ├── Entities.js             # 实体系统 (2.8KB, 122行)
│   │   │   │   ├── Events.js               # 事件系统 (836B, 44行)
│   │   │   │   ├── LODs.js                 # LOD系统 (943B, 47行)
│   │   │   │   ├── Nametags.js             # 名牌系统 (12KB, 369行)
│   │   │   │   ├── NodeClient.js           # Node客户端系统 (494B, 33行)
│   │   │   │   ├── NodeEnvironment.js      # Node环境系统 (409B, 23行)
│   │   │   │   ├── Particles.js            # 粒子系统 (11KB, 400行)
│   │   │   │   ├── Physics.js              # 物理系统 (21KB, 626行)
│   │   │   │   ├── Scripts.js              # 脚本系统 (2.2KB, 90行)
│   │   │   │   ├── Settings.js             # 设置系统 (1.6KB, 71行)
│   │   │   │   ├── Snaps.js                # 吸附系统 (672B, 39行)
│   │   │   │   ├── Stage.js                # 舞台系统 (11KB, 386行)
│   │   │   │   ├── Wind.js                 # 风力系统 (539B, 23行)
│   │   │   │   └── XR.js                   # XR系统 (2.2KB, 73行)
│   │   │
│   │   ├── 📦 第三方库 (libs/)
│   │   │   ├── csm/                        # CSM相关库
│   │   │   ├── gltfloader/                 # GLTF加载器
│   │   │   ├── stats-gl/                   # WebGL统计库
│   │   │   ├── three-custom-shader-material/ # Three.js自定义材质
│   │   │   └── three-vrm/                  # Three.js VRM支持
│   │   │
│   │   ├── 📦 物理引擎
│   │   │   ├── physx-js-webidl.js          # PhysX WebIDL绑定 (2.2MB)
│   │   │   └── physx-js-webidl.wasm        # PhysX WebAssembly (4.8MB)
│   │   │
│   │   ├── 🔧 核心工具
│   │   │   ├── World.js                    # 世界核心类 (5.8KB, 242行)
│   │   │   ├── Socket.js                   # WebSocket通信 (1.2KB, 62行)
│   │   │   ├── loadPhysX.js                # PhysX物理引擎加载器 (713B, 23行)
│   │   │   ├── lockdown.js                 # 安全锁定机制 (610B, 22行)
│   │   │   ├── packets.js                  # 网络数据包处理 (1.2KB, 65行)
│   │   │   ├── storage.js                  # 存储管理 (2.0KB, 90行)
│   │   │   ├── utils.js                    # 通用工具函数 (1.3KB, 53行)
│   │   │   ├── utils-client.js             # 客户端工具函数 (409B, 17行)
│   │   │   └── utils-server.js             # 服务器工具函数 (776B, 41行)
│   │   │
│   │   └── 🔍 额外功能 (extras/)
│
│   ├── 🖥️ Node客户端 (node-client/)
│   │   └── index.js                        # Node客户端入口
│   │
│   ├── 🖥️ 服务器 (server/)
│   │   ├── index.js                        # 服务器入口 (6.0KB, 216行)
│   │   ├── bootstrap.js                    # 服务器启动脚本 (313B, 13行)
│   │   ├── collections.js                  # 集合管理 (1.7KB, 48行)
│   │   ├── db.js                           # 数据库操作 (6.0KB, 227行)
│   │   └── Storage.js                      # 服务器存储 (827B, 40行)
│   │
│   └── 🌍 世界资源 (world/)
│       ├── assets/                         # 世界资源文件 (3D模型、音频、贴图等)
│       │   ├── avatar.vrm                  # 默认头像模型 (4.6MB)
│       │   ├── crash-block.glb             # 碰撞方块模型 (4.5KB, 9行)
│       │   ├── emote-fall.glb              # 跌落表情动画 (59KB, 32行)
│       │   ├── emote-flip.glb              # 翻转表情动画 (84KB, 58行)
│       │   ├── emote-float.glb             # 漂浮表情动画 (231KB, 549行)
│       │   ├── emote-idle.glb              # 空闲表情动画 (87KB, 120行)
│       │   ├── emote-jump.glb              # 跳跃表情动画 (65KB, 11行)
│       │   ├── emote-run.glb               # 跑步表情动画 (90KB, 87行)
│       │   ├── emote-talk.glb              # 说话表情动画 (89KB, 83行)
│       │   └── emote-walk.glb              # 行走表情动画 (62KB, 41行)
│       └── collections/                    # 世界集合配置
│           └── default/                    # 默认集合配置
│               ├── manifest.json           # 集合清单 (87B, 5行)
│               ├── Image.hyp               # 图像组件配置 (11KB, 110行)
│               ├── Model.hyp               # 模型组件配置 (7.8KB, 50行)
│               ├── Text.hyp                # 文本组件配置 (7.2KB, 120行)
│               └── Video.hyp               # 视频组件配置 (207KB, 1010行)
│
├── 🐙 GitHub相关 (.github/)
│   └── workflows/                          # GitHub Actions工作流
│       └── docker.yml                      # Docker自动化构建 (1.3KB, 50行)
│
├── 💻 VSCode配置 (.vscode/)
│   └── settings.json                       # VSCode项目设置
│
└── 📄 项目文档
    ├── README.md                           # 项目说明文档 (3.6KB, 119行)
    ├── overview.png                        # 项目概览图 (216KB)
    ├── CHANGELOG.md                        # 项目更新日志 (16KB, 431行)
    ├── LICENSE                             # GPL-3.0开源许可证 (34KB, 675行)
    ├── CONTRIBUTING.md                     # 贡献指南 (3.8KB, 127行)
    ├── CODE_OF_CONDUCT.md                  # 行为准则 (5.0KB, 72行)
    ├── DOCKER.md                           # Docker部署说明 (890B, 28行)
    ├── ISSUE_TEMPLATE.md                   # 问题报告模板 (885B, 35行)
    └── PULL_REQUEST_TEMPLATE.md            # PR模板 (1.1KB, 40行)
```

## 🔧 技术架构

### 核心技术栈
- **前端框架**: React 19.1.0 + Three.js 0.173.0
- **物理引擎**: PhysX (WebAssembly)
- **网络协议**: WebSocket + msgpackr
- **音视频**: LiveKit
- **数据库**: SQLite (better-sqlite3)
- **服务器**: Fastify
- **构建工具**: esbuild
- **VR支持**: WebXR + @pixiv/three-vrm

### 系统组件说明

#### 🎮 核心系统 (Core Systems)
1. **世界管理** - 创建和管理不同类型的世界实例
2. **实体系统** - 管理游戏对象和玩家
3. **物理引擎** - PhysX驱动的物理模拟
4. **网络系统** - 实时多人协作
5. **渲染系统** - Three.js驱动的3D渲染

#### 🎨 节点组件 (Node Components)
- **视觉组件**: Mesh, SkinnedMesh, Image, Video, Particles
- **交互组件**: Collider, RigidBody, Controller
- **UI组件**: UI, UIView, UIText, UIImage
- **媒体组件**: Audio, Video
- **功能组件**: Avatar, Action, Anchor, Group

#### 🖥️ 客户端系统 (Client Systems)
- **图形渲染**: ClientGraphics - 管理3D场景渲染
- **用户控制**: ClientControls - 处理用户输入
- **网络通信**: ClientNetwork - 处理客户端网络
- **音频处理**: ClientAudio - 3D空间音频
- **构建工具**: ClientBuilder - 实时世界编辑

#### 🖥️ 服务器系统 (Server Systems)
- **世界持久化**: 管理世界状态和数据
- **玩家管理**: 处理玩家连接和同步
- **权限控制**: 管理访问权限和安全
- **数据存储**: SQLite数据库操作

## 🚀 主要功能

### 1. 世界创建与编辑
- 实时3D世界构建
- 可视化编辑器
- 资源管理系统
- 版本控制

### 2. 多人协作
- 实时同步
- 空间音频
- 文本聊天
- 用户权限管理

### 3. 头像系统
- VRM格式支持
- 自定义头像
- 表情和动画
- 跨平台兼容

### 4. 应用框架
- JavaScript应用开发
- 组件化架构
- 热重载支持
- API丰富

### 5. 物理模拟
- 真实物理碰撞
- 刚体动力学
- 关节约束
- 性能优化

### 6. 🗣️ 语音聊天系统
- **空间音频**: 基于位置的3D语音聊天
- **LiveKit集成**: 低延迟音频处理
- **表情联动**: 说话时自动触发表情动画
- **权限管理**: 灵活的语音权限控制

### 7. 🎨 丰富的UI组件系统
- **现代化界面**: React 19.1.0 + 现代UI设计
- **响应式设计**: 适配不同屏幕尺寸
- **组件化架构**: 高度可复用的UI组件
- **实时编辑器**: 内置代码编辑器和脚本编辑器
- **构建工具**: 强大的实时世界构建系统

### 8. 🎮 交互式应用系统
- **组件式开发**: 基于节点的应用构建
- **热重载**: 实时代码更新和调试
- **丰富API**: 完整的组件API文档
- **多媒体支持**: 音频、视频、图像、粒子系统

## 📊 依赖分析

### 主要依赖 (dependencies)
- **Web框架**: fastify, @fastify/*
- **3D引擎**: three, @pixiv/three-vrm
- **UI框架**: react, react-dom
- **物理引擎**: PhysX (WebAssembly)
- **网络**: livekit-client, livekit-server-sdk
- **数据库**: better-sqlite3, knex
- **工具库**: lodash-es, moment, nanoid

### 开发依赖 (devDependencies)
- **构建工具**: esbuild
- **代码规范**: eslint, prettier
- **React支持**: @babel/preset-react

## 🔨 开发工作流

### 构建命令
```bash
npm run dev               # 开发模式
npm run build             # 生产构建
npm start                 # 启动服务器
npm run viewer:dev        # 查看器开发模式
npm run client:dev        # 客户端开发模式
npm run node-client:dev   # Node客户端开发模式
```

### 代码质量
```bash
npm run lint              # 代码检查
npm run lint:fix          # 自动修复
npm run format            # 代码格式化
npm run check             # 完整检查
```

### 世界管理
```bash
npm run world:clean       # 清理孤立的世界资源
```

## 📋 项目特色功能详解

### 🎯 核心架构亮点
1. **模块化设计**: 高度解耦的系统架构，支持独立开发和测试
2. **性能优化**: PhysX物理引擎 + Three.js渲染优化
3. **实时协作**: WebSocket + msgpackr 高效网络通信
4. **扩展性强**: 基于组件的可扩展架构

### 🚀 官方原版特性
本项目是Hyperfy的官方开源实现，具有以下核心特性：
- **完整的3D世界构建**: 30KB的ClientBuilder系统，支持实时世界编辑
- **高级UI系统**: 48KB的Sidebar组件，31KB的CoreUI组件
- **物理引擎**: 4.8MB的PhysX WebAssembly引擎
- **多媒体支持**: 完整的音频、视频、图像、粒子系统

### 📊 代码规模统计
- **总文件数**: 150+ 个源代码文件
- **核心系统**: 40+ 个系统组件
- **节点组件**: 24个 3D节点组件
- **UI组件**: 25+ 个React UI组件
- **最大文件**: Sidebar.js (48KB, 1628行)
- **物理引擎**: PhysX WebAssembly (4.8MB)

## 🌐 部署架构

### Docker支持
- 完整的Docker配置
- 多阶段构建优化
- 生产环境就绪

### 环境配置
- 环境变量管理
- 多环境支持
- 安全配置

## 🎯 应用场景

1. **虚拟活动与会议** - 空间音频的现场聚会
2. **交互式展厅** - 产品展示和演示
3. **社交空间** - 协作社区中心
4. **游戏环境** - 沉浸式游戏世界
5. **教育体验** - 互动学习空间
6. **创意展示** - 3D艺术和互动装置

## 📈 项目状态

该项目目前处于Alpha阶段（v0.13.0），正在将参考平台代码转换为完全可自托管的世界。大部分功能已经在此仓库中实现，但仍需要连接以支持自托管。API在此期间很可能会发生变化。

### 最新更新 (v0.13.0)
- **新增功能**: 新的加载屏幕和世界图像设置
- **VR支持**: VR控制器交互按钮支持
- **实验性功能**: 地形(splatmaps)支持
- **性能优化**: 减少移动/VR设备的默认阴影质量
- **UI改进**: Z键切换所有UI包括应用

## 🌐 相关链接

- **官方网站**: https://hyperfy.io/
- **GitHub仓库**: https://github.com/hyperfy-xyz/hyperfy
- **社区文档**: https://hyperfy.how
- **在线体验**: https://play.hyperfy.xyz/
- **Twitter**: https://x.com/hyperfy_io

## 📜 许可证

本项目使用GPL-3.0许可证，要求Node.js 22.11.0版本。

---

## 📋 文档更新说明

*本文档基于Hyperfy官方原版项目的当前状态进行了深度扫描和分析，包含了完整的目录结构、详细的文件信息和代码规模统计。*

### 📊 扫描统计结果
- **扫描深度**: 4-5层目录结构
- **分析文件**: 150+ 个源代码文件
- **代码规模**: 总计约10MB+ 源代码
- **项目版本**: v0.13.0
- **资源文件**: 丰富的3D模型、HDR环境贴图、动画文件

### 🔍 重要发现
1. **官方原版实现**: 这是Hyperfy的官方开源实现
2. **完整的3D世界构建**: 强大的实时世界编辑系统
3. **现代化技术栈**: React 19.1.0 + Three.js 0.173.0
4. **UI组件丰富**: 25+个高质量React UI组件
5. **物理引擎集成**: PhysX WebAssembly引擎

**文档更新时间**: 2025年1月8日  
**项目路径**: `D:\hyperfy-main`  
**分析范围**: 完整项目目录树状结构、文件大小统计和功能说明  
**更新内容**: 基于官方原版hyperfy项目实际扫描结果的完整文档重写 