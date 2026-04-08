import React, { useState, useEffect } from 'react';
import { Card, Tag, Button, Checkbox, Space, Empty, Spin, Input, Select, DatePicker } from 'antd';
import { PlusOutlined, ClockCircleOutlined, EditOutlined, DeleteOutlined, ScheduleOutlined } from '@ant-design/icons';
import { Todo, TodoList, Tag as TagType } from '../types';
import { apiClient } from '../utils/api';
import { isSameDayAs } from '../utils/dateUtils';
import toast from 'react-hot-toast';
import TodoModal from '../components/TodoModal';
import { format, addDays } from 'date-fns';
import dayjs from 'dayjs';

const TomorrowPage: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [lists, setLists] = useState<TodoList[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [inlineEditTitle, setInlineEditTitle] = useState('');
  const [inlineEditDescription, setInlineEditDescription] = useState('');
  const [inlineEditDueDate, setInlineEditDueDate] = useState<any>(null);
  const [inlineEditStartTime, setInlineEditStartTime] = useState('');
  const [inlineEditEndTime, setInlineEditEndTime] = useState('');
  const [inlineEditPriority, setInlineEditPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const tomorrow = addDays(new Date(), 1);
  const tomorrowStr = format(tomorrow, 'yyyy-MM-dd');

  useEffect(() => {
    fetchData();
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
        // 过滤明天到期的任务（未完成）
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

  const getListInfo = (listId?: string) => lists.find(l => l.id === listId);
  const getTagsInfo = (tagIds?: string[]) => {
    if (!tagIds) return [];
    return tags.filter(t => tagIds.includes(t.id));
  };

  const getPriorityTag = (priority: string) => {
    const colors: Record<string, string> = { high: 'red', medium: 'blue', low: 'green' };
    const labels: Record<string, string> = { high: '高', medium: '中', low: '低' };
    return <Tag color={colors[priority]}>{labels[priority]}</Tag>;
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
            {todos.map((todo) => {
              const listInfo = getListInfo(todo.listId);
              const tagsInfo = getTagsInfo(todo.tags);

              return (
                <div
                  key={todo.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    padding: '16px 0',
                    borderBottom: '1px solid #f0f0f0',
                  }}
                >
                  <Checkbox
                    checked={todo.completed}
                    onClick={(e) => handleToggleComplete(todo, e)}
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
                            marginBottom: '4px',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: '#404040',
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
                        {todo.description && (
                          <div
                            onClick={() => !todo.completed && handleStartInlineEdit(todo)}
                            style={{
                              marginBottom: '8px',
                              color: '#8c8c8c',
                              fontSize: '14px',
                              cursor: todo.completed ? 'default' : 'text',
                              padding: '2px 4px',
                              borderRadius: '2px',
                              transition: 'background 0.2s',
                            }}
                            onMouseEnter={(e) => !todo.completed && (e.currentTarget.style.backgroundColor = '#f5f5f5')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            {todo.description}
                          </div>
                        )}
                      </>
                    )}
                    <Space size={[8, 8]} wrap>
                      {todo.startTime && (
                        <Tag icon={<ClockCircleOutlined />}>
                          {todo.startTime}{todo.endTime && ` - ${todo.endTime}`}
                        </Tag>
                      )}
                      {getPriorityTag(todo.priority)}
                      {listInfo && <Tag color={listInfo.color}>{listInfo.name}</Tag>}
                      {tagsInfo.map(tag => (
                        <Tag key={tag.id} color={tag.color}>{tag.name}</Tag>
                      ))}
                    </Space>
                  </div>
                  <Space>
                    <Button type="text" icon={<EditOutlined />} onClick={() => { setEditingTodo(todo); setIsModalOpen(true); }} />
                    <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDeleteTodo(todo.id)} />
                  </Space>
                </div>
              );
            })}
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
