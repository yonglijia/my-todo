import React, { useState, useEffect } from 'react';
import { Card, Tag, Button, Checkbox, Space, Empty, Spin, Segmented } from 'antd';
import { PlusOutlined, CalendarOutlined, ClockCircleOutlined, EditOutlined, DeleteOutlined, InboxOutlined } from '@ant-design/icons';
import { Todo, TodoList, Tag as TagType } from '../types';
import { apiClient } from '../utils/api';
import { formatDate } from '../utils/dateUtils';
import toast from 'react-hot-toast';
import TodoModal from '../components/TodoModal';

const TodoListPage: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(true);
  const [lists, setLists] = useState<TodoList[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);

  useEffect(() => {
    fetchTodos();
    fetchListsAndTags();
  }, []);

  useEffect(() => {
    filterTodos();
  }, [todos, filter]);

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

  const getListInfo = (listId?: string) => {
    return lists.find(l => l.id === listId);
  };

  const getTagsInfo = (tagIds?: string[]) => {
    if (!tagIds) return [];
    return tags.filter(t => tagIds.includes(t.id));
  };

  const getPriorityTag = (priority: string) => {
    const colors: Record<string, string> = {
      high: 'red',
      medium: 'blue',
      low: 'green',
    };
    const labels: Record<string, string> = {
      high: '高',
      medium: '中',
      low: '低',
    };
    return <Tag color={colors[priority]}>{labels[priority]}</Tag>;
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
            {filteredTodos.map((todo) => {
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
                    opacity: todo.completed ? 0.6 : 1,
                  }}
                >
                  <Checkbox
                    checked={todo.completed}
                    onClick={(e) => handleToggleComplete(todo, e)}
                    style={{ marginTop: '0px', marginRight: '12px', marginLeft: '0px' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      textDecoration: todo.completed ? 'line-through' : 'none',
                      color: todo.completed ? '#8c8c8c' : '#404040',
                      marginBottom: '4px',
                      fontSize: '14px',
                      fontWeight: 500,
                    }}>
                      {todo.title}
                    </div>
                    {todo.description && (
                      <div style={{ marginBottom: '8px', color: '#8c8c8c', fontSize: '14px' }}>
                        {todo.description}
                      </div>
                    )}
                    <Space size={[8, 8]} wrap>
                      {todo.dueDate && (
                        <Tag icon={<CalendarOutlined />}>
                          {formatDate(todo.dueDate, 'MM月dd日')}
                        </Tag>
                      )}
                      {todo.startTime && (
                        <Tag icon={<ClockCircleOutlined />}>
                          {todo.startTime}{todo.endTime && ` - ${todo.endTime}`}
                        </Tag>
                      )}
                      {getPriorityTag(todo.priority)}
                      {listInfo && (
                        <Tag color={listInfo.color}>{listInfo.name}</Tag>
                      )}
                      {tagsInfo.map(tag => (
                        <Tag key={tag.id} color={tag.color}>{tag.name}</Tag>
                      ))}
                    </Space>
                  </div>
                  <Space>
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => handleEditTodo(todo)}
                    />
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteTodo(todo.id)}
                    />
                  </Space>
                </div>
              );
            })}
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
