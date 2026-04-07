# 📝 Todo Master - 精美待办事项管理应用

一个功能完整、设计精美的现代化待办事项管理应用，支持日历视图和多日期选择功能。

## ✨ 主要特性

- 🎯 **完整的Todo管理** - 创建、编辑、删除、优先级、时间段、提醒
- 📅 **强大日历功能** - 日/周/月视图，支持多选日期
- 🎨 **精美UI设计** - 玻璃态效果，流畅动画，现代配色
- 📱 **响应式设计** - 完美适配各种屏幕尺寸
- ⚡ **高性能** - React 18 + TypeScript + Vite
- 🔒 **数据安全** - SQLite数据库，本地存储

## 🚀 快速开始

### ⚡ 前置要求

在开始之前，请确保已安装：
- **Node.js** 16+ ([安装指南](./SETUP.md))
- **npm** (通常随Node.js安装)

### 🎯 一键启动（推荐）

```bash
git clone <repository-url>
cd my-todo
./dev.sh
```

访问 http://localhost:3000 开始使用！

### 📖 首次使用？

请查看 [环境设置指南](./SETUP.md) 了解详细的安装和配置步骤。

### 📋 更多命令

```bash
./dev.sh help         # 查看所有可用命令
./dev.sh seed         # 初始化演示数据
./dev.sh install      # 安装依赖
./dev.sh clean        # 清理项目
```

## 📁 项目结构

```
my-todo/
├── 📱 web/                    # Web应用目录
│   ├── frontend/              # React前端
│   │   ├── src/
│   │   │   ├── components/    # UI组件
│   │   │   ├── pages/         # 页面组件
│   │   │   ├── utils/         # 工具函数
│   │   │   └── types/         # 类型定义
│   │   └── package.json
│   ├── backend/               # Express后端
│   │   ├── src/
│   │   │   ├── controllers/   # 控制器
│   │   │   ├── models/        # 数据模型
│   │   │   ├── routes/        # API路由
│   │   │   └── middleware/    # 中间件
│   │   └── package.json
│   └── README.md              # 详细技术文档
├── 🚀 dev.sh                  # 开发脚本
├── 🚀 start.sh                # 简单启动脚本
└── 📖 README.md               # 项目概览（本文件）
```

## 🎯 核心功能演示

### 📝 Todo管理
- ✅ 创建Todo，支持标题、描述、优先级
- ⏰ 设置时间段（开始时间、结束时间）
- 🔔 自定义提醒信息
- 🎯 三级优先级（高/中/低）
- ✅ 完成状态切换

### 📅 日历功能
- 📅 三种视图：日、周、月
- 🖱️ **多选日期**：点击多个日期，批量创建Todo
- 🎨 日历上直接显示Todo预览
- 📍 日期高亮和数量标记

### 🎨 设计亮点
- 玻璃态效果（毛玻璃背景）
- 蓝紫渐变配色
- 流畅的微交互动画
- 现代化卡片设计
- 响应式布局

## 🛠️ 技术栈

### 前端
- **React 18** - 现代化UI框架
- **TypeScript** - 类型安全
- **Vite** - 极速构建工具
- **Tailwind CSS** - 原子化CSS框架
- **Framer Motion** - 流畅动画库
- **date-fns** - 日期处理

### 后端
- **Node.js** - 服务端运行时
- **Express** - Web应用框架
- **SQLite** - 轻量级数据库
- **TypeScript** - 类型安全
- **Joi** - 数据验证

## 🌟 使用场景

- 📅 个人时间管理和任务规划
- 👥 团队项目任务跟踪
- 📝 会议安排和提醒
- 🎯 目标设定和进度管理
- 🏠 日常生活事务管理

## 🔮 未来规划

- [ ] 👤 用户认证和个人账户
- [ ] 🏷️ Todo分类和标签系统
- [ ] 👨‍👩‍👧‍👦 团队协作和分享功能
- [ ] 📱 移动端应用（React Native）
- [ ] 📊 数据统计和报表分析
- [ ] 🌙 深色模式主题
- [ ] 🔄 数据同步和云存储
- [ ] 🔔 推送通知和邮件提醒

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

---

**享受使用 Todo Master 的乐趣！** 🎉