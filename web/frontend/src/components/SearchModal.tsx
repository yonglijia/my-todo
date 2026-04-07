import React, { useState, useEffect, useRef } from 'react';
import { Modal, Input, List, Tag, Space } from 'antd';
import { SearchOutlined, CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Todo, TodoList, Tag as TagType } from '../types';
import { apiClient } from '../utils/api';
import { formatDate } from '../utils/dateUtils';

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ open, onClose }) => {
  const [searchText, setSearchText] = useState('');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [lists, setLists] = useState<TodoList[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      fetchListsAndTags();
      setSearchText('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  useEffect(() => {
    if (searchText.trim()) {
      searchTodos();
    } else {
      setTodos([]);
    }
  }, [searchText]);

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

  const searchTodos = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getTodos();
      if (response.success && response.data) {
        const query = searchText.toLowerCase();
        const filtered = response.data.filter(todo =>
          todo.title.toLowerCase().includes(query) ||
          (todo.description && todo.description.toLowerCase().includes(query))
        );
        setTodos(filtered);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
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

  const handleSelectTodo = (todo: Todo) => {
    // 跳转到对应的清单或标签页面
    if (todo.listId) {
      navigate(`/list/${todo.listId}`);
    } else {
      navigate('/');
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      centered
      closable={false}
      styles={{
        content: {
          padding: 0,
          borderRadius: 12,
          overflow: 'hidden',
        },
        body: {
          padding: 0,
        },
      }}
    >
      <div style={{ padding: '16px' }}>
        <Input
          ref={inputRef}
          prefix={<SearchOutlined style={{ color: '#8c8c8c', fontSize: 18 }} />}
          placeholder="搜索任务..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={handleKeyDown}
          size="large"
          variant="borderless"
          style={{ fontSize: 18 }}
        />
      </div>

      {searchText.trim() && (
        <div style={{ maxHeight: 400, overflowY: 'auto', borderTop: '1px solid #f0f0f0' }}>
          {loading ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#8c8c8c' }}>
              搜索中...
            </div>
          ) : todos.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#8c8c8c' }}>
              没有找到相关任务
            </div>
          ) : (
            <div>
              {todos.map((todo) => {
                const listInfo = getListInfo(todo.listId);
                const tagsInfo = getTagsInfo(todo.tags);

                return (
                  <div
                    key={todo.id}
                    onClick={() => handleSelectTodo(todo)}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f0f0f0',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f5f5f5';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 4,
                    }}>
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          border: `2px solid ${todo.completed ? '#52c41a' : '#d9d9d9'}`,
                          background: todo.completed ? '#52c41a' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {todo.completed && (
                          <span style={{ color: '#fff', fontSize: 10 }}>✓</span>
                        )}
                      </div>
                      <span style={{
                        textDecoration: todo.completed ? 'line-through' : 'none',
                        color: todo.completed ? '#8c8c8c' : '#262626',
                        fontSize: 14,
                      }}>
                        {todo.title}
                      </span>
                    </div>
                    <Space size={[8, 8]} wrap style={{ marginLeft: 24 }}>
                      {todo.dueDate && (
                        <Tag icon={<CalendarOutlined />} style={{ margin: 0 }}>
                          {formatDate(todo.dueDate, 'MM月dd日')}
                        </Tag>
                      )}
                      {todo.startTime && (
                        <Tag icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
                          {todo.startTime}
                        </Tag>
                      )}
                      {getPriorityTag(todo.priority)}
                      {listInfo && (
                        <Tag color={listInfo.color} style={{ margin: 0 }}>{listInfo.name}</Tag>
                      )}
                      {tagsInfo.map(tag => (
                        <Tag key={tag.id} color={tag.color} style={{ margin: 0 }}>{tag.name}</Tag>
                      ))}
                    </Space>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {!searchText && (
        <div style={{ padding: 24, textAlign: 'center', color: '#8c8c8c', borderTop: '1px solid #f0f0f0' }}>
          输入关键词搜索任务
        </div>
      )}
    </Modal>
  );
};

export default SearchModal;
