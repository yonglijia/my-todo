import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Button, Checkbox, Empty, Spin, Tag, Space, Input, Select, DatePicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Todo, Tag as TagType } from '../types';
import { apiClient } from '../utils/api';
import toast from 'react-hot-toast';
import TodoModal from '../components/TodoModal';
import dayjs from 'dayjs';

const TagPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [tagInfo, setTagInfo] = useState<TagType | null>(null);
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [inlineEditTitle, setInlineEditTitle] = useState('');
  const [inlineEditDescription, setInlineEditDescription] = useState('');
  const [inlineEditDueDate, setInlineEditDueDate] = useState<any>(null);
  const [inlineEditStartTime, setInlineEditStartTime] = useState('');
  const [inlineEditEndTime, setInlineEditEndTime] = useState('');
  const [inlineEditPriority, setInlineEditPriority] = useState<'low' | 'medium' | 'high'>('medium');

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

  const handleStartInlineEdit = (todo: Todo) => {
    setInlineEditId(todo.id);
    setInlineEditTitle(todo.title);
    setInlineEditDescription(todo.description || '');
    setInlineEditDueDate(todo.dueDate ? new Date(todo.dueDate) : null);
    setInlineEditStartTime(todo.startTime || '');
    setInlineEditEndTime(todo.endTime || '');
    setInlineEditPriority(todo.priority as 'low' | 'medium' | 'high');
  };

  const handleSaveInlineEdit = async (todo: Todo) => {
    if (!inlineEditTitle.trim()) {
      toast.error('任务标题不能为空');
      return;
    }
    try {
      const response = await apiClient.updateTodo(todo.id, {
        title: inlineEditTitle,
        description: inlineEditDescription,
        dueDate: inlineEditDueDate ? new Date(inlineEditDueDate).toISOString().split('T')[0] : undefined,
        startTime: inlineEditStartTime || undefined,
        endTime: inlineEditEndTime || undefined,
        priority: inlineEditPriority,
      });
      if (response.success && response.data) {
        setTodos(todos.map(t => t.id === todo.id ? response.data! : t));
        toast.success('已更新');
      } else {
        toast.error(response.error || '更新失败');
      }
    } catch (error) {
      toast.error('更新失败');
    } finally {
      handleCancelInlineEdit();
    }
  };

  const handleCancelInlineEdit = () => {
    setInlineEditId(null);
    setInlineEditTitle('');
    setInlineEditDescription('');
    setInlineEditDueDate(null);
    setInlineEditStartTime('');
    setInlineEditEndTime('');
    setInlineEditPriority('medium');
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
                  style={{ marginTop: '0px', marginRight: '12px', marginLeft: '0px' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  {inlineEditId === todo.id && !todo.completed ? (
                    <div style={{ marginBottom: '12px' }}>
                      <Input
                        value={inlineEditTitle}
                        onChange={(e) => setInlineEditTitle(e.target.value)}
                        placeholder="输入任务标题"
                        style={{ marginBottom: '8px' }}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveInlineEdit(todo);
                          } else if (e.key === 'Escape') {
                            handleCancelInlineEdit();
                          }
                        }}
                      />
                      <Input.TextArea
                        value={inlineEditDescription}
                        onChange={(e) => setInlineEditDescription(e.target.value)}
                        placeholder="输入任务描述"
                        rows={2}
                        style={{ marginBottom: '8px' }}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            handleCancelInlineEdit();
                          }
                        }}
                      />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                        <DatePicker
                          value={inlineEditDueDate ? dayjs(inlineEditDueDate) : null}
                          onChange={(date) => setInlineEditDueDate(date)}
                          placeholder="选择截止日期"
                          style={{ width: '100%' }}
                        />
                        <Select
                          value={inlineEditPriority}
                          onChange={(value) => setInlineEditPriority(value)}
                          options={[
                            { label: '低', value: 'low' },
                            { label: '中', value: 'medium' },
                            { label: '高', value: 'high' },
                          ]}
                          placeholder="选择优先级"
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                        <Input
                          value={inlineEditStartTime}
                          onChange={(e) => setInlineEditStartTime(e.target.value)}
                          placeholder="开始时间 (如: 09:00)"
                          type="text"
                        />
                        <Input
                          value={inlineEditEndTime}
                          onChange={(e) => setInlineEditEndTime(e.target.value)}
                          placeholder="结束时间 (如: 17:00)"
                          type="text"
                        />
                      </div>
                      <Space>
                        <Button
                          type="primary"
                          size="small"
                          onClick={() => handleSaveInlineEdit(todo)}
                        >
                          保存
                        </Button>
                        <Button
                          size="small"
                          onClick={handleCancelInlineEdit}
                        >
                          取消
                        </Button>
                      </Space>
                    </div>
                  ) : (
                    <>
                      <div
                        onClick={() => !todo.completed && handleStartInlineEdit(todo)}
                        style={{
                          textDecoration: todo.completed ? 'line-through' : 'none',
                          marginBottom: '4px',
                          fontSize: '14px',
                          fontWeight: 500,
                          color: todo.completed ? '#8c8c8c' : '#404040',
                          cursor: todo.completed ? 'default' : 'text',
                          padding: '2px 4px',
                          borderRadius: '2px',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => !todo.completed && (e.currentTarget.style.backgroundColor = '#f5f5f5')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        {todo.title}
                      </div>
                      <Space>
                        {todo.description && (
                          <span
                            onClick={() => !todo.completed && handleStartInlineEdit(todo)}
                            style={{
                              color: '#8c8c8c',
                              cursor: todo.completed ? 'default' : 'text',
                              padding: '2px 4px',
                              borderRadius: '2px',
                              transition: 'background 0.2s',
                            }}
                            onMouseEnter={(e: any) => !todo.completed && (e.currentTarget.style.backgroundColor = '#f5f5f5')}
                            onMouseLeave={(e: any) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            {todo.description}
                          </span>
                        )}
                        <Tag color={todo.priority === 'high' ? 'red' : todo.priority === 'medium' ? 'blue' : 'green'}>
                          {todo.priority === 'high' ? '高' : todo.priority === 'medium' ? '中' : '低'}
                        </Tag>
                      </Space>
                    </>
                  )}
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
