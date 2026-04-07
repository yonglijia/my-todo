import { TodoModel } from './src/models/Todo';
import { CreateTodoRequest } from './src/types';

const sampleTodos: CreateTodoRequest[] = [
  {
    title: '完成项目提案',
    description: '准备下周一的项目提案演示文稿，包含技术架构和时间规划',
    priority: 'high',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '12:00',
    reminder: '提前30分钟提醒'
  },
  {
    title: '团队会议',
    description: '讨论Q4季度目标和KPI设定',
    priority: 'medium',
    dueDate: new Date().toISOString().split('T')[0],
    startTime: '14:00',
    endTime: '15:30',
    reminder: '提前15分钟提醒'
  },
  {
    title: '代码审查',
    description: '审查新功能的代码实现，确保代码质量',
    priority: 'medium',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startTime: '16:00',
    endTime: '17:00'
  },
  {
    title: '健身锻炼',
    description: '每周三次的健身计划，今天是有氧运动',
    priority: 'low',
    dueDate: new Date().toISOString().split('T')[0],
    startTime: '18:30',
    endTime: '19:30'
  },
  {
    title: '学习新技术',
    description: '学习React 18的新特性和最佳实践',
    priority: 'low',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startTime: '20:00',
    endTime: '21:00'
  },
  {
    title: '客户邮件回复',
    description: '回复重要客户关于产品功能的咨询邮件',
    priority: 'high',
    dueDate: new Date().toISOString().split('T')[0],
    reminder: '今日必须完成'
  },
  {
    title: '数据库备份',
    description: '执行月度数据库备份和归档',
    priority: 'medium',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startTime: '22:00',
    endTime: '23:00'
  },
  {
    title: '周末聚会准备',
    description: '准备周末朋友聚会的食物和活动安排',
    priority: 'low',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }
];

async function seedDatabase() {
  console.log('🌱 开始初始化演示数据...');
  
  try {
    // 清空现有数据
    const todos = await TodoModel.findAll();
    for (const todo of todos) {
      await TodoModel.delete(todo.id);
    }
    console.log('🗑️ 已清空现有数据');

    // 添加演示数据
    for (const todoData of sampleTodos) {
      const todo = await TodoModel.create(todoData);
      console.log(`✅ 创建待办事项: ${todo.title}`);
    }

    console.log('🎉 演示数据初始化完成！');
    console.log(`📊 总共创建了 ${sampleTodos.length} 个待办事项`);
    
  } catch (error) {
    console.error('❌ 初始化数据失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  seedDatabase().then(() => {
    console.log('🚀 可以启动应用了！');
    process.exit(0);
  });
}

export { seedDatabase };