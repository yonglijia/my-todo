import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Empty, Spin } from 'antd';
import { UndoOutlined, EditOutlined, DeleteOutlined, CheckCircleFilled } from '@ant-design/icons';
import { Todo, TodoList, Tag as TagType } from '../types';
import { apiClient } from '../utils/api';
import toast from 'react-hot-toast';
import TodoModal from '../components/TodoModal';
import TodoItem from '../components/TodoItem';

const CompletedPage: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [lists, setLists] = useState<TodoList[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);

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
        // 过滤已完成的任务
        const completedTodos = todosRes.data.filter(todo => todo.completed);
        // 按更新时间倒序排列
        completedTodos.sort((a, b) => {
          const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return timeB - timeA;
        });
        setTodos(completedTodos);
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
        toast.success('已恢复为未完成');
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
      if (!savedTodo.completed) {
        // 如果取消了完成状态，从列表中移除
        setTodos(todos.filter(t => t.id !== savedTodo.id));
      } else {
        setTodos(todos.map(t => t.id === savedTodo.id ? savedTodo : t));
      }
      toast.success('已更新');
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

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#f6ffed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircleFilled style={{ fontSize: '20px', color: '#52c41a' }} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>已完成</h1>
              <p style={{ margin: 0, fontSize: '14px', color: '#8c8c8c' }}>{todos.length} 个已完成任务</p>
            </div>
          </div>
        </div>
      </div>

      <Card>
        {todos.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="还没有已完成的任务"
          />
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
                  opacity: 0.7,
                }}
              >
                <TodoItem
                  todo={todo}
                  lists={lists}
                  tags={tags}
                  onToggleComplete={handleToggleComplete}
                  onDelete={handleDeleteTodo}
                  onEdit={(todo) => { setEditingTodo(todo); setIsModalOpen(true); }}
                  onFieldChange={() => {}}
                />
              </div>
            ))}
          </div>
        )}
      </Card>

      <TodoModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTodo(null); }}
        onSave={handleTodoSave}
        todo={editingTodo}
      />
    </div>
  );
};

export default CompletedPage;
