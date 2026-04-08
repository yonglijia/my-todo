import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Empty, Spin, Segmented, Input } from 'antd';
import { PlusOutlined, InboxOutlined } from '@ant-design/icons';
import { Todo, TodoList, Tag as TagType } from '../types';
import { apiClient } from '../utils/api';
import toast from 'react-hot-toast';
import TodoModal from '../components/TodoModal';
import TodoItem from '../components/TodoItem';

const TodoListPage: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(true);
  const [lists, setLists] = useState<TodoList[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  
  // 自动保存的延迟计时器
  const saveTimers = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    fetchTodos();
    fetchListsAndTags();
  }, []);

  useEffect(() => {
    filterTodos();
  }, [todos, filter]);

  // 清理定时器
  useEffect(() => {
    return () => {
      Object.values(saveTimers.current).forEach(timer => clearTimeout(timer));
    };
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getTodos();
      if (response.success && response.data) {
        setTodos(response.data);
      } else {
        toast.error(response.error || '获取待办事项失败');
      }
    } catch (error) {
      toast.error('获取待办事项失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchListsAndTags = async () => {
    try {
      const [listsRes, tagsRes] = await Promise.all([
        apiClient.getLists(),
        apiClient.getTags(),
      ]);
      if (listsRes.success && listsRes.data) {
        setLists(listsRes.data);
      }
      if (tagsRes.success && tagsRes.data) {
        setTags(tagsRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch lists and tags:', error);
    }
  };

  const filterTodos = () => {
    let result = todos;

    switch (filter) {
      case 'active':
        result = result.filter(todo => !todo.completed);
        break;
      case 'completed':
        result = result.filter(todo => todo.completed);
        break;
    }

    setFilteredTodos(result);
  };

  const handleCreateTodo = () => {
    setEditingTodo(null);
    setIsModalOpen(true);
  };

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setIsModalOpen(true);
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      const response = await apiClient.deleteTodo(id);
      if (response.success) {
        setTodos(todos.filter(todo => todo.id !== id));
        toast.success('已删除');
      } else {
        toast.error(response.error || '删除失败');
      }
    } catch (error) {
      toast.error('删除失败');
    }
  };

  const handleToggleComplete = async (todo: Todo, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await apiClient.updateTodo(todo.id, {
        completed: !todo.completed
      });
      if (response.success && response.data) {
        setTodos(todos.map(t => t.id === todo.id ? response.data! : t));
      } else {
        toast.error(response.error || '更新失败');
      }
    } catch (error) {
      toast.error('更新失败');
    }
  };

  const handleTodoSave = (savedTodo: Todo) => {
    if (editingTodo) {
      setTodos(todos.map(t => t.id === savedTodo.id ? savedTodo : t));
      toast.success('已更新');
    } else {
      setTodos([savedTodo, ...todos]);
      toast.success('已添加');
    }
    setIsModalOpen(false);
    setEditingTodo(null);
  };


  // 自动保存函数
  const autoSaveTodo = async (todoId: string, updates: Partial<Todo>) => {
    try {
      const response = await apiClient.updateTodo(todoId, updates);
      if (response.success && response.data) {
        setTodos(todos.map(t => t.id === todoId ? response.data! : t));
      } else {
        toast.error(response.error || '保存失败');
        // 恢复原值
        const originalTodo = todos.find(t => t.id === todoId);
        if (originalTodo) {
          setTodos([...todos]);
        }
      }
    } catch (error) {
      toast.error('保存失败');
      // 恢复原值
      const originalTodo = todos.find(t => t.id === todoId);
      if (originalTodo) {
        setTodos([...todos]);
      }
    }
  };

  // 处理字段变化，支持延迟保存
  const handleFieldChange = (todoId: string, field: string, value: any) => {
    // 清除之前的定时器
    if (saveTimers.current[`${todoId}_${field}`]) {
      clearTimeout(saveTimers.current[`${todoId}_${field}`]);
    }

    // 立即更新UI
    setTodos(todos.map(t => {
      if (t.id === todoId) {
        return { ...t, [field]: value };
      }
      return t;
    }));

    // 延迟500ms后保存
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
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#e6f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <InboxOutlined style={{ fontSize: '20px', color: '#1677ff' }} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>收集箱</h1>
              <p style={{ margin: 0, fontSize: '14px', color: '#8c8c8c' }}>{filteredTodos.length} 个任务</p>
            </div>
          </div>
          <Button
            type="primary"
            shape="circle"
            icon={<PlusOutlined />}
            size="large"
            onClick={handleCreateTodo}
            title="添加任务"
          />
        </div>

        <Segmented
          options={[
            { label: '全部', value: 'all' },
            { label: '未完成', value: 'active' },
            { label: '已完成', value: 'completed' },
          ]}
          value={filter}
          onChange={(value) => setFilter(value as 'all' | 'active' | 'completed')}
        />
      </div>

      <Card>
        {filteredTodos.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={filter === 'completed' ? '暂无已完成任务' : '暂无任务'}
          >
            {filter !== 'completed' && (
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateTodo}>
                创建第一个任务
              </Button>
            )}
          </Empty>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                lists={lists}
                tags={tags}
                onToggleComplete={handleToggleComplete}
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

export default TodoListPage;
