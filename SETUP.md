# 🛠️ 环境设置指南

## 📋 系统要求

### 必需软件
- **Node.js** 16.0+ (推荐 18.x 或更高版本)
- **npm** (通常随Node.js一起安装)

### 可选软件
- **Git** (用于版本控制)

## 🔧 安装 Node.js

### 方法1: 官方下载 (推荐所有用户)
1. 访问 [Node.js官网](https://nodejs.org/)
2. 下载 LTS 版本（长期支持版）
3. 运行安装程序，按提示完成安装

### 方法2: 使用 Homebrew (macOS用户)
```bash
# 安装Homebrew (如果还没有)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装Node.js
brew install node
```

### 方法3: 使用 nvm (推荐开发者)
```bash
# 安装nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 重启终端或执行
source ~/.bashrc

# 安装最新LTS版本的Node.js
nvm install --lts
nvm use lts
```

## ✅ 验证安装

打开终端，运行以下命令验证安装：

```bash
node --version
# 应该显示类似: v18.18.0

npm --version
# 应该显示类似: 9.8.1
```

## 🚀 开始使用项目

安装Node.js后，就可以使用我们便捷的开发脚本了：

```bash
cd my-todo
./dev.sh help     # 查看所有命令
./dev.sh install  # 安装项目依赖
./dev.sh          # 启动应用
```

## 💡 开发者提示

### 推荐的开发工具
- **VS Code** - 优秀的代码编辑器
- **React Developer Tools** - 浏览器扩展
- **SQLite Browser** - 查看数据库内容

### 常用命令
```bash
# 查看帮助
./dev.sh help

# 启动开发服务器
./dev.sh

# 重置项目
./dev.sh clean
./dev.sh install
./dev.sh seed

# 查看日志
tail -f web/backend/logs/app.log
```

## 🐛 常见问题

### Q: npm命令找不到
A: 确保Node.js安装成功，并且PATH环境变量配置正确

### Q: 权限被拒绝
A: 在macOS/Linux上，可能需要给脚本执行权限：
```bash
chmod +x dev.sh
chmod +x start.sh
```

### Q: 端口被占用
A: 修改配置文件中的端口号，或停止占用端口的进程：
```bash
# 查看占用端口的进程
lsof -i :3000
lsof -i :3001

# 杀死进程
kill -9 <PID>
```

### Q: 依赖安装失败
A: 尝试清除npm缓存：
```bash
npm cache clean --force
./dev.sh clean
./dev.sh install
```

## 🎉 下一步

环境设置完成后，你就可以开始使用Todo Master了！

1. 运行 `./dev.sh seed` 初始化演示数据
2. 运行 `./dev.sh` 启动应用
3. 访问 http://localhost:3000 开始使用

如有问题，请查看详细的[技术文档](web/README.md)。