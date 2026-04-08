import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Empty, Spin } from 'antd';
import { PlusOutlined, ScheduleOutlined } from '@ant-design/icons';
import { Todo, TodoList, Tag as TagType } from '../types';
import { apiClient } from '../utils/api';
import { isSameDayAs } from '../utils/dateUtils';
import toast from 'react-hot-toast';
import TodoModal from '../components/TodoModal';
import TodoItem from '../components/TodoItem';
import { format, addDays } from 'date-fns';

const TomorrowPage: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [lists, setLists] = useState<TodoList[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  
  const saveTimers = useRef<Record<string, NodeJS.Timeout>>({});

  const tomorrow = addDays(new Date(), 1);
  const tomorrowStr = format(tomorrow, 'yyyy-MM-dd');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    return () => {
      Object.values(saveTimers.current).forEach(timer => clearTimeout(timer));
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [todosRes, listsRes, tagsRes] = await Promise.all([
        apiClient.getTodos(),
        apiClient.getLists(),
        apiClient.getTags(),
      ]);
      
      if (todosRes.success && todosRes.data) {
        const tomorrowTodos = todosRes.data.filter(todo => 
          !todo.completed && todo.dueDate && isSameDayAs(todo.dueDate, tomorrowStr)
        );
        setTodos(tomorrowTodos);
      }
      if (listsRes.success && listsRes.data) {
        setLists(listsRes.data);
      }
      if (tagsRes.success && tagsRes.data) {
        setTags(tagsRes.data);
      }
    } catch (error) {
      toast.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (todo: Todo, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await apiClient.updateTodo(todo.id, {
        completed: !todo.completed
      });
      if (response.success && response.data) {
        setTodos(todos.filter(t => t.id !== todo.id));
      }
    } catch (error) {
      toast.error('更新失败');
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      const response = await apiClient.deleteTodo(id);
      if (response.success) {
        setTodos(todos.filter(todo => todo.id !== id));
        toast.success('已删除');
      }
    } catch (error) {
      toast.error('删除失败');
    }
  };

  const handleTodoSave = (savedTodo: Todo) => {
    if (editingTodo) {
      setTodos(todos.map(t => t.id === savedTodo.id ? savedTodo : t));
      toast.success('已更新');
    } else {
      if (savedTodo.dueDate && isSameDayAs(savedTodo.dueDate, tomorrowStr) && !savedTodo.completed) {
        setTodos([savedTodo, ...todos]);
        toast.success('已添加');
      } else {
        toast.success('已添加');
      }
    }
    setIsModalOpen(false);
    setEditingTodo(null);
  };

  const autoSaveTodo = async (todoId: string, updates: Partial<Todo>) => {
    try {
      const response = await apiClient.updateTodo(todoId, updates);
      if (response.success && response.data) {
        setTodos(todos.map(t => t.id === todoId ? response.data! : t));
      } else {
        toast.error(response.error || '保存失败');
        setTodos([...todos]);
      }
    } catch (error) {
      toast.error('保存失败');
      setTodos([...todos]);
    }
  };

  const handleFieldChange = (todoId: string, field: string, value: any) => {
    if (saveTimers.current[`${todoId}_${field}`]) {
      clearTimeout(saveTimers.current[`${todoId}_${field}`]);
    }

    setTodos(todos.map(t => {
      if (t.id === todoId) {
        return { ...t, [field]: value };
      }
      return t;
    }));

    saveTimers.current[`${todoId}_${field}`] = setTimeout(() => {
      const todo = todos.find(t => t.id === todoId);
      if (todo) {
        autoSaveTodo(todoId, { [field]: value });
      }
    }, 500);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#f6ffed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ScheduleOutlined style={{ fontSize: '20px', color: '#52c41a' }} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>明天</h1>
              <p style={{ margin: 0, fontSize: '14px', color: '#8c8c8c' }}>{format(tomorrow, 'M月d日 EEEE', { locale: undefined })} · {todos.length} 个任务</p>
            </div>
          </div>
          <Button
            type="primary"
            shape="circle"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => { setEditingTodo(null); setIsModalOpen(true); }}
            title="添加任务"
          />
        </div>
      </div>

      <Card>
        {todos.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="明天没有任务"
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingTodo(null); setIsModalOpen(true); }}>
              添加明日任务
            </Button>
          </Empty>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                lists={lists}
                tags={tags}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDeleteTodo}
                onEdit={(todo) => { setEditingTodo(todo); setIsModalOpen(true); }}
                onFieldChange={handleFieldChange}
              />
            ))}
          </div>
        )}
      </Card>

      <TodoModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTodo(null); }}
        onSave={handleTodoSave}
        todo={editingTodo}
        defaultDueDate={tomorrowStr}
      />
    </div>
  );
};

export default TomorrowPage;
