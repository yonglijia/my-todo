import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Grid, Clock, Plus } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Todo } from '../types';
import { apiClient } from '../utils/api';
import TodoModal from './TodoModal';
import TodoCard from './TodoCard';

interface CalendarProps {
  view: 'month' | 'week' | 'day';
  onViewChange: (view: 'month' | 'week' | 'day') => void;
}

const CalendarComponent: React.FC<CalendarProps> = ({ view, onViewChange }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Date | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await apiClient.getTodos();
      if (response.success && response.data) {
        setTodos(response.data);
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDateMouseDown = (date: Date) => {
    if (view === 'month') {
      setIsDragging(true);
      setDragStart(date);
      setSelectedDates([date]);
    } else {
      handleDateClick(date);
    }
  };

  const handleDateMouseEnter = (date: Date) => {
    if (isDragging && dragStart) {
      const start = dragStart < date ? dragStart : date;
      const end = dragStart < date ? date : dragStart;
      const range: Date[] = [];
      let current = new Date(start);
      while (current <= end) {
        range.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      setSelectedDates(range);
    }
  };

  const handleDateMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  const handleDateClick = (date: Date) => {
    if (selectedDates.length > 0) {
      const lastDate = selectedDates[selectedDates.length - 1];
      if (isSameDay(date, lastDate)) {
        setSelectedDates([date]);
      } else if (date > lastDate) {
        const range: Date[] = [];
        let current = new Date(lastDate);
        while (current <= date) {
          range.push(new Date(current));
          current.setDate(current.getDate() + 1);
        }
        setSelectedDates(range);
      } else {
        setSelectedDates([date]);
      }
    } else {
      setSelectedDates([date]);
    }
  };

  const handleCreateTodo = () => {
    if (selectedDates.length > 0) {
      const firstDate = selectedDates[0];
      setEditingTodo({
        id: '',
        title: '',
        description: '',
        completed: false,
        priority: 'high',
        dueDate: format(firstDate, 'yyyy-MM-dd'),
        startTime: '',
        endTime: '',
        reminder: '',
        createdAt: '',
        updatedAt: ''
      });
    } else {
      setEditingTodo(null);
    }
    setIsModalOpen(true);
    setSelectedDates([]);
  };

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setIsModalOpen(true);
  };

  const handleTodoSave = (savedTodo: Todo) => {
    if (editingTodo) {
      setTodos(todos.map(t => t.id === savedTodo.id ? savedTodo : t));
    } else {
      setTodos([...todos, savedTodo]);
    }
    setIsModalOpen(false);
    setEditingTodo(null);
  };

  const getTodosForDate = (date: Date) => {
    return todos.filter(todo => todo.dueDate === format(date, 'yyyy-MM-dd'));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-l-red-400' };
      case 'medium':
        return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-l-blue-400' };
      case 'low':
        return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-l-green-400' };
      default:
        return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-l-slate-400' };
    }
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(new Date(day));
      day.setDate(day.getDate() + 1);
    }

    const weekDays = ['一', '二', '三', '四', '五', '六', '日'];

    return (
      <div 
        className="dida-card p-5"
        ref={calendarRef}
        onMouseLeave={() => {
          if (isDragging) {
            setIsDragging(false);
            setDragStart(null);
          }
        }}
      >
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((dayName, index) => (
            <div key={index} className="text-center text-sm font-medium text-slate-500 py-2">
              {dayName}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1" onMouseUp={handleDateMouseUp}>
          {days.map((day, index) => {
            const dayTodos = getTodosForDate(day);
            const isSelected = selectedDates.some(selectedDate => isSameDay(day, selectedDate));
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isCurrentDay = isToday(day);

            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                onMouseDown={() => handleDateMouseDown(day)}
                onMouseEnter={() => handleDateMouseEnter(day)}
                className={`calendar-date min-h-[100px] p-2 select-none ${
                  !isCurrentMonth ? 'other-month' : ''
                } ${isSelected ? 'selected' : isCurrentDay ? 'today' : ''}`}
              >
                <div className="text-sm font-medium mb-1 text-left">
                  {format(day, 'd')}
                </div>
                
                {/* 显示所有任务 */}
                <div className="space-y-1 overflow-hidden">
                  {dayTodos.map((todo) => {
                    const colors = getPriorityColor(todo.priority);
                    return (
                      <div
                        key={todo.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTodo(todo);
                        }}
                        className={`text-xs px-1.5 py-0.5 rounded truncate cursor-pointer border-l-2 transition-all hover:shadow-sm ${
                          colors.bg
                        } ${colors.text} ${colors.border} ${
                          isSelected ? 'opacity-90' : ''
                        } ${todo.completed ? 'opacity-50 line-through' : ''}`}
                      >
                        {todo.title}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      days.push(addDays(weekStart, i));
    }

    return (
      <div className="dida-card p-5">
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const dayTodos = getTodosForDate(day);
            const isCurrentDay = isToday(day);

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleDateClick(day)}
                className={`p-3 rounded border cursor-pointer transition-all ${
                  isCurrentDay 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="text-center mb-2">
                  <div className="text-xs text-slate-500">
                    {format(day, 'EEE', { locale: zhCN })}
                  </div>
                  <div className={`text-lg font-semibold ${
                    isCurrentDay ? 'text-blue-600' : 'text-slate-900'
                  }`}>
                    {format(day, 'd')}
                  </div>
                </div>
                
                <div className="space-y-1">
                  {dayTodos.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-300">
                      无任务
                    </div>
                  ) : (
                    dayTodos.map((todo) => (
                      <TodoCard
                        key={todo.id}
                        todo={todo}
                        onEdit={handleEditTodo}
                        compact
                      />
                    ))
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const dayTodos = getTodosForDate(currentDate);

    return (
      <div className="dida-card p-6">
        <div className="text-center mb-6">
          <div className="text-sm text-slate-500 mb-1">
            {format(currentDate, 'EEEE', { locale: zhCN })}
          </div>
          <div className={`text-4xl font-bold ${
            isToday(currentDate) ? 'text-blue-600' : 'text-slate-900'
          }`}>
            {format(currentDate, 'd')}
          </div>
          <div className="text-sm text-slate-500 mt-1">
            {format(currentDate, 'yyyy年MM月', { locale: zhCN })}
          </div>
        </div>

        <div className="space-y-2">
          {dayTodos.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>今天没有安排</p>
            </div>
          ) : (
            dayTodos.map((todo) => (
              <TodoCard
                key={todo.id}
                todo={todo}
                onEdit={handleEditTodo}
              />
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          
          <h2 className="text-lg font-semibold text-slate-900 min-w-[160px] text-center">
            {format(currentDate, 'yyyy年MM月', { locale: zhCN })}
          </h2>
          
          <button
            onClick={handleNextMonth}
            className="p-2 rounded hover:bg-slate-100 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-slate-100 rounded p-1">
            {(['month', 'week', 'day'] as const).map((viewType) => (
              <button
                key={viewType}
                onClick={() => onViewChange(viewType)}
                className={`tab-item flex items-center space-x-1 text-sm ${
                  view === viewType ? 'active' : ''
                }`}
              >
                {viewType === 'month' && <Grid className="w-4 h-4" />}
                {viewType === 'week' && <CalendarIcon className="w-4 h-4" />}
                {viewType === 'day' && <Clock className="w-4 h-4" />}
                <span>
                  {viewType === 'month' && '月'}
                  {viewType === 'week' && '周'}
                  {viewType === 'day' && '日'}
                </span>
              </button>
            ))}
          </div>

          {selectedDates.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleCreateTodo}
              className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-sm transition-all flex items-center justify-center hover:scale-105"
              title={`为 ${selectedDates.length} 天创建任务`}
            >
              <Plus className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      </div>

      <motion.div
        key={view}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {view === 'month' && renderMonthView()}
        {view === 'week' && renderWeekView()}
        {view === 'day' && renderDayView()}
      </motion.div>

      <TodoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTodo(null);
        }}
        onSave={handleTodoSave}
        todo={editingTodo}
      />
    </div>
  );
};

export default CalendarComponent;
