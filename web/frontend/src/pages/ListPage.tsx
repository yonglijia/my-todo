import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Button, Empty, Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Todo, TodoList, Tag as TagType } from '../types';
import { apiClient } from '../utils/api';
import toast from 'react-hot-toast';
import TodoModal from '../components/TodoModal';
import TodoItem from '../components/TodoItem';

const ListPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [listInfo, setListInfo] = useState<TodoList | null>(null);
  const [tags, setTags] = useState<TagType[]>([]);
  
  const saveTimers = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    fetchListInfo();
    fetchTodos();
  }, [id]);

  useEffect(() => {
    return () => {
      Object.values(saveTimers.current).forEach(timer => clearTimeout(timer));
    };
  }, []);

  const fetchListInfo = async () => {
    if (!id) return;
    try {
      const response = await apiClient.getList(id);
      if (response.success && response.data) {
        setListInfo(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch list:', error);
    }
  };

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getTodos();
      if (response.success && response.data) {
        setTodos(response.data.filter(todo => todo.listId === id));
      }
    } catch (error) {
      toast.error('获取待办事项失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTodo = () => {
    setEditingTodo(null);
    setIsModalOpen(true);
  };

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setIsModalOpen(true);
  };

  const handleDeleteTodo = async (todoId: string) => {
    try {
      const response = await apiClient.deleteTodo(todoId);
      if (response.success) {
        setTodos(todos.filter(todo => todo.id !== todoId));
        toast.success('已删除');
      }
    } catch (error) {
      toast.error('删除失败');
    }
  };

  const handleToggleComplete = async (todo: Todo) => {
    try {
      const response = await apiClient.updateTodo(todo.id, {
        completed: !todo.completed
      });
      if (response.success && response.data) {
        setTodos(todos.map(t => t.id === todo.id ? response.data! : t));
      }
    } catch (error) {
      toast.error('更新失败');
    }
  };

  const handleTodoSave = (savedTodo: Todo) => {
    if (editingTodo) {
      setTodos(todos.map(t => t.id === savedTodo.id ? savedTodo : t));
    } else {
      if (savedTodo.listId === id) {
        setTodos([savedTodo, ...todos]);
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

  if (!listInfo) {
    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <Card>
          <Empty description="清单不存在" />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: listInfo.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: listInfo.color }} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>{listInfo.name}</h1>
              <p style={{ margin: 0, fontSize: '14px', color: '#8c8c8c' }}>{todos.length} 个任务</p>
            </div>
          </div>
          <Button
            type="primary"
            shape="circle"
            icon={<PlusOutlined />}
            size="large"
            onClick={handleCreateTodo}
          />
        </div>
      </div>

      <Card>
        {todos.length === 0 ? (
          <Empty description="暂无任务">
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateTodo}>
              创建任务
            </Button>
          </Empty>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                lists={listInfo ? [listInfo] : []}
                tags={tags}
                onToggleComplete={(todo, e) => { e.stopPropagation(); handleToggleComplete(todo); }}
                onDelete={handleDeleteTodo}
                onEdit={handleEditTodo}
                onFieldChange={handleFieldChange}
              />
            ))}
          </div>
        )}
      </Card>

      <TodoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleTodoSave}
        todo={editingTodo}
      />
    </div>
  );
};

export default ListPage;
