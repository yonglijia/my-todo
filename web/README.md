# Todo Master - 精美待办事项管理应用

一个使用 React + TypeScript + Express + SQLite 构建的现代化待办事项管理应用，具备精美的UI设计和完整的日历功能。

## ✨ 功能特性

### 📝 Todo 核心功能
- ✅ 完整的CRUD操作（创建、读取、更新、删除）
- 📝 支持标题、详细描述
- ⏰ 可设置时间段（开始时间、结束时间）
- 🔔 支持提醒设置
- 🎯 三级优先级（高、中、低）
- ✅ 完成状态管理

### 📅 日历管理
- 📅 三种视图模式：日视图、周视图、月视图
- 🖱️ 支持鼠标选中多日快速创建Todo
- 🎨 日历上直接显示Todo
- 🔍 不同视图下的Todo预览和管理
- 📍 日期高亮和Todo标记

### 🎨 设计特点
- 🎨 现代化玻璃态设计
- 🌈 优雅的配色和渐变效果
- ✨ 流畅的动画和微交互
- 📱 响应式设计（为移动端做好准备）
- 🎯 直观的用户体验

## 🛠️ 技术栈

### 前端
- **React 18** - 现代化UI框架
- **TypeScript** - 类型安全
- **Vite** - 快速构建工具
- **Tailwind CSS** - 实用优先的CSS框架
- **Framer Motion** - 流畅动画库
- **Lucide React** - 精美图标库
- **date-fns** - 日期处理工具

### 后端
- **Node.js** - 运行时环境
- **Express** - Web框架
- **SQLite** - 轻量级数据库
- **TypeScript** - 类型安全
- **Joi** - 数据验证
- **Winston** - 日志记录

## 🚀 快速开始

### 环境要求
- Node.js 16+
- npm 或 yarn

### 🎯 最简单的启动方式（推荐）

在项目根目录下直接运行：

```bash
cd my-todo
./dev.sh
```

这个智能脚本会自动：
- 检查并安装依赖
- 启动前端和后端服务
- 提供完整的开发环境

### 📋 开发脚本使用说明

在项目根目录下，可以使用以下命令：

```bash
./dev.sh              # 启动应用（默认）
./dev.sh start        # 启动应用
./dev.sh install      # 安装所有依赖
./dev.sh seed         # 初始化演示数据
./dev.sh clean        # 清理依赖和构建文件
./dev.sh help         # 显示帮助信息
```

### 🔧 手动启动方式

如果你想手动控制每个步骤：

1. **克隆项目**
```bash
git clone <repository-url>
cd my-todo
```

2. **安装后端依赖**
```bash
cd web/backend
npm install
```

3. **启动后端服务**
```bash
npm run dev
```
后端服务将在 http://localhost:3001 启动

4. **安装前端依赖**（新终端）
```bash
cd web/frontend
npm install
```

5. **启动前端服务**
```bash
npm run dev
```
前端应用将在 http://localhost:3000 启动

### 开发模式
- 后端：`npm run dev` - 热重载开发模式
- 前端：`npm run dev` - Vite开发服务器

### 生产构建
- 后端：`npm run build && npm start`
- 前端：`npm run build && npm preview`

### 🌱 初始化演示数据

首次运行时，你可能想要一些演示数据来体验功能：

```bash
# 方法1: 使用开发脚本（推荐）
./dev.sh seed

# 方法2: 手动运行
cd web/backend
npm run seed
```

这将创建8个示例待办事项，包含不同优先级和时间的任务。

## 📁 项目结构

```
web/
├── frontend/                 # React前端应用
│   ├── src/
│   │   ├── components/       # 可复用组件
│   │   │   ├── Calendar.tsx  # 日历组件
│   │   │   ├── TodoModal.tsx # Todo编辑弹窗
│   │   │   ├── TodoCard.tsx  # Todo卡片
│   │   │   ├── Header.tsx    # 页面头部
│   │   │   └── Sidebar.tsx   # 侧边栏
│   │   ├── pages/           # 页面组件
│   │   │   ├── TodoList.tsx  # Todo列表页面
│   │   │   └── Calendar.tsx  # 日历页面
│   │   ├── hooks/           # 自定义Hook
│   │   ├── utils/           # 工具函数
│   │   ├── types/           # TypeScript类型定义
│   │   └── styles/          # 样式文件
│   ├── package.json
│   └── vite.config.ts
├── backend/                  # Express后端API
│   ├── src/
│   │   ├── controllers/     # 控制器
│   │   ├── models/          # 数据模型
│   │   ├── routes/          # 路由定义
│   │   ├── middleware/      # 中间件
│   │   ├── utils/           # 工具函数
│   │   └── types/           # TypeScript类型
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## 🔌 API 接口

### Todo 相关
- `GET /api/todos` - 获取所有Todo
- `GET /api/todos/:id` - 获取特定Todo
- `POST /api/todos` - 创建新Todo
- `PUT /api/todos/:id` - 更新Todo
- `DELETE /api/todos/:id` - 删除Todo
- `GET /api/todos/range?startDate=&endDate=` - 按日期范围获取Todo

### 健康检查
- `GET /api/health` - 服务健康状态

## 🎯 核心功能说明

### 日历多选功能
1. 在月视图中点击第一个日期
2. 继续点击后续日期进行多选
3. 选中的日期会高亮显示
4. 点击"为选中日期创建待办"按钮
5. 自动设置第一个选中日期为截止日期

### Todo优先级
- 🔴 高优先级：红色边框，重要紧急
- 🟡 中优先级：黄色边框，一般重要
- 🟢 低优先级：绿色边框，可以稍后处理

### 时间管理
- 支持设置开始时间和结束时间
- 可以设置提醒信息
- 日历视图会显示时间信息

## 🎨 UI/UX 设计亮点

- **玻璃态效果**：现代化的半透明设计
- **流畅动画**：所有交互都有精心设计的过渡效果
- **渐变配色**：蓝紫渐变背景，营造清新感
- **响应式设计**：适配各种屏幕尺寸
- **微交互**：悬停、点击等状态都有视觉反馈

## 🔮 未来规划

- [ ] 用户认证和个人账户
- [ ] Todo分类和标签
- [ ] 团队协作功能
- [ ] 移动端APP（React Native）
- [ ] 数据导入/导出
- [ ] 主题切换（深色模式）
- [ ] 数据统计和报表

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

## 📄 许可证

MIT License