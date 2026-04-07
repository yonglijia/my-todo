import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Check } from 'lucide-react';
import { Todo } from '../types';
import { formatTime } from '../utils/dateUtils';

interface TodoCardProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  compact?: boolean;
}

const TodoCard: React.FC<TodoCardProps> = ({ todo, onEdit, compact = false }) => {
  const priorityLabels = {
    high: '高',
    medium: '中',
    low: '低',
  };

  return (
    <motion.div
      whileHover={{ scale: compact ? 1.01 : 1.005 }}
      onClick={() => onEdit(todo)}
      className={`todo-item ${todo.completed ? 'completed' : ''} ${
        compact ? 'p-2' : 'p-3'
      }`}
    >
      <div className="flex items-start w-full">
        {/* 复选框 */}
        <div className={`todo-checkbox mt-0.5 mr-3 ${
          todo.completed ? 'checked' : ''
        }`}>
          {todo.completed && (
            <Check className="w-3 h-3 text-white" />
          )}
        </div>
        
        {/* 内容 */}
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium ${
            compact ? 'text-sm' : 'text-base'
          } ${
            todo.completed 
              ? 'line-through text-slate-500' 
              : 'text-slate-900'
          }`}>
            {todo.title}
          </h4>
          
          {!compact && todo.description && (
            <p className="text-sm text-slate-500 mt-1 mb-2">
              {todo.description}
            </p>
          )}

          <div className="flex items-center space-x-2 mt-1">
            {(todo.startTime || todo.endTime) && (
              <div className="flex items-center space-x-1 text-xs text-slate-500">
                <Clock className="w-3 h-3" />
                <span>
                  {todo.startTime && todo.endTime 
                    ? `${formatTime(todo.startTime)}-${formatTime(todo.endTime)}`
                    : formatTime(todo.startTime || todo.endTime || '')
                  }
                </span>
              </div>
            )}
            
            <span className={`priority-tag ${todo.priority}`}>
              {priorityLabels[todo.priority]}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TodoCard;
