#!/bin/bash

# 显示帮助信息
show_help() {
    echo "🎯 Todo Master 开发脚本"
    echo ""
    echo "用法:"
    echo "  ./dev.sh [选项]"
    echo ""
    echo "选项:"
    echo "  start     - 启动应用（默认）"
    echo "  seed      - 初始化演示数据"
    echo "  install   - 安装所有依赖"
    echo "  clean     - 清理依赖和构建文件"
    echo "  help      - 显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  ./dev.sh           # 启动应用"
    echo "  ./dev.sh seed      # 初始化演示数据"
    echo "  ./dev.sh install   # 安装依赖"
}

# 安装依赖
install_deps() {
    echo "📦 安装项目依赖..."
    
    # 检查Node.js和npm是否安装
    if ! command -v node &> /dev/null; then
        echo "❌ 错误: 未检测到Node.js！"
        echo "请先安装Node.js: https://nodejs.org/"
        echo "推荐使用Node.js 18+版本"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "❌ 错误: 未检测到npm！"
        echo "请确保npm已正确安装"
        exit 1
    fi
    
    echo "✅ Node.js版本: $(node --version)"
    echo "✅ npm版本: $(npm --version)"
    
    if [ ! -d "web/backend/node_modules" ]; then
        echo "  📥 安装后端依赖..."
        cd web/backend && npm install && cd ../..
    else
        echo "  ✅ 后端依赖已存在"
    fi
    
    if [ ! -d "web/frontend/node_modules" ]; then
        echo "  📥 安装前端依赖..."
        cd web/frontend && npm install && cd ../..
    else
        echo "  ✅ 前端依赖已存在"
    fi
    
    echo "🎉 依赖安装完成！"
}

# 初始化演示数据
seed_data() {
    echo "🌱 初始化演示数据..."
    
    if [ ! -d "web/backend/node_modules" ]; then
        echo "❌ 后端依赖未安装，请先运行: ./dev.sh install"
        exit 1
    fi
    
    cd web/backend && npm run seed && cd ../..
    echo "✅ 演示数据初始化完成！"
}

# 启动应用
start_app() {
    echo "🚀 启动 Todo Master 应用..."
    
    # 检查依赖
    if [ ! -d "web/backend/node_modules" ] || [ ! -d "web/frontend/node_modules" ]; then
        echo "📦 检测到缺少依赖，正在安装..."
        install_deps
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
    echo "💾 数据库: web/backend/todos.db"
    echo ""
    echo "🎯 提示:"
    echo "  - 如需演示数据，请运行: ./dev.sh seed"
    echo "  - 按 Ctrl+C 停止服务"
    echo ""
    
    # 等待用户中断
    trap "echo '🛑 正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
    wait
}

# 清理依赖和构建文件
clean() {
    echo "🧹 清理项目..."
    
    if [ -d "web/backend/node_modules" ]; then
        rm -rf web/backend/node_modules
        echo "  🗑️ 已清理后端依赖"
    fi
    
    if [ -d "web/frontend/node_modules" ]; then
        rm -rf web/frontend/node_modules
        echo "  🗑️ 已清理前端依赖"
    fi
    
    if [ -d "web/backend/dist" ]; then
        rm -rf web/backend/dist
        echo "  🗑️ 已清理后端构建文件"
    fi
    
    if [ -d "web/frontend/dist" ]; then
        rm -rf web/frontend/dist
        echo "  🗑️ 已清理前端构建文件"
    fi
    
    if [ -f "web/backend/todos.db" ]; then
        rm -f web/backend/todos.db
        echo "  🗑️ 已清理数据库文件"
    fi
    
    echo "✅ 清理完成！"
}

# 主逻辑
case "${1:-start}" in
    "start"|"")
        start_app
        ;;
    "seed")
        seed_data
        ;;
    "install")
        install_deps
        ;;
    "clean")
        clean
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        echo "❌ 未知选项: $1"
        echo "运行 './dev.sh help' 查看帮助信息"
        exit 1
        ;;
esac