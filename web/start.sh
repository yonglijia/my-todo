#!/bin/bash

# 获取脚本所在目录的父目录（项目根目录）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🚀 启动 Todo Master 应用..."
echo "📍 项目根目录: $PROJECT_ROOT"
echo "🌐 Web目录: $SCRIPT_DIR"

# 检查是否安装了依赖
if [ ! -d "$SCRIPT_DIR/backend/node_modules" ]; then
    echo "📦 安装后端依赖..."
    cd "$SCRIPT_DIR/backend" && npm install
fi

if [ ! -d "$SCRIPT_DIR/frontend/node_modules" ]; then
    echo "📦 安装前端依赖..."
    cd "$SCRIPT_DIR/frontend" && npm install
fi

echo "🔧 启动后端服务..."
cd "$SCRIPT_DIR/backend"
npm run dev &
BACKEND_PID=$!

echo "🎨 启动前端服务..."
cd "$SCRIPT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ 应用启动完成！"
echo "📱 前端: http://localhost:3000"
echo "🔌 后端: http://localhost:3001"
echo ""
echo "按 Ctrl+C 停止服务"

# 等待用户中断
trap "echo '🛑 正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; cd '$PROJECT_ROOT'; exit" INT
wait