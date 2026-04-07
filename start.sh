#!/bin/bash

echo "🚀 启动 Todo Master 应用..."

# 检查web目录是否存在
if [ ! -d "web" ]; then
    echo "❌ 错误: 找不到web目录！"
    echo "请确保在项目根目录运行此脚本"
    exit 1
fi

# 检查是否安装了依赖
if [ ! -d "web/backend/node_modules" ]; then
    echo "📦 安装后端依赖..."
    cd web/backend && npm install && cd ../..
fi

if [ ! -d "web/frontend/node_modules" ]; then
    echo "📦 安装前端依赖..."
    cd web/frontend && npm install && cd ../..
fi

echo "🔧 启动后端服务..."
cd web/backend
npm run dev &
BACKEND_PID=$!
cd ../..

echo "🎨 启动前端服务..."
cd web/frontend
npm run dev &
FRONTEND_PID=$!
cd ../..

echo ""
echo "✅ 应用启动完成！"
echo "📱 前端: http://localhost:3000"
echo "🔌 后端: http://localhost:3001"
echo ""
echo "按 Ctrl+C 停止服务"

# 等待用户中断
trap "echo '🛑 正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait