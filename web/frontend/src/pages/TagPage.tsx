import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Button, Checkbox, Empty, Spin, Tag, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Todo, Tag as TagType } from '../types';
import { apiClient } from '../utils/api';
import toast from 'react-hot-toast';
import TodoModal from '../components/TodoModal';

const TagPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [tagInfo, setTagInfo] = useState<TagType | null>(null);

  useEffect(() => {
    fetchTagInfo();
    fetchTodos();
  }, [id]);

  const fetchTagInfo = async () => {
    if (!id) return;
    try {
      const response = await apiClient.getTag(id);
      if (response.success && response.data) {
        setTagInfo(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch tag:', error);
    }
  };

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getTodos();
      if (response.success && response.data) {
        setTodos(response.data.filter(todo => todo.tags?.includes(id)));
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
      if (savedTodo.tags?.includes(id)) {
        setTodos([savedTodo, ...todos]);
      }
    }
    setIsModalOpen(false);
    setEditingTodo(null);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!tagInfo) {
    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <Card>
          <Empty description="标签不存在" />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: tagInfo.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: tagInfo.color }} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>{tagInfo.name}</h1>
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
              <div
                key={todo.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  padding: '16px 0',
                  borderBottom: '1px solid #f0f0f0',
                  opacity: todo.completed ? 0.6 : 1,
                }}
              >
                <Checkbox
                  checked={todo.completed}
                  onChange={() => handleToggleComplete(todo)}
                  style={{ marginTop: '4px', marginRight: '12px' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    marginBottom: '4px',
                  }}>
                    {todo.title}
                  </div>
                  <Space>
                    {todo.description && <span style={{ color: '#8c8c8c' }}>{todo.description}</span>}
                    <Tag color={todo.priority === 'high' ? 'red' : todo.priority === 'medium' ? 'blue' : 'green'}>
                      {todo.priority === 'high' ? '高' : todo.priority === 'medium' ? '中' : '低'}
                    </Tag>
                  </Space>
                </div>
                <Space>
                  <Button type="text" icon={<EditOutlined />} onClick={() => handleEditTodo(todo)} />
                  <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDeleteTodo(todo.id)} />
                </Space>
              </div>
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

export default TagPage;
