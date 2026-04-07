import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Card, Badge, Spin, Typography, Modal, Input, Select, Button, Popover, Space, Divider } from 'antd';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { Todo } from '../types';
import { apiClient } from '../utils/api';
import toast from 'react-hot-toast';

const { Text } = Typography;

const CalendarPage: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [dateRange, setDateRange] = useState<{ start: Dayjs | null; end: Dayjs | null }>({
    start: null,
    end: null,
  });
  const isSelecting = useRef(false);
  const currentMonth = useRef(dayjs());
  
  // 时间段任务创建
  const [rangeTaskModalOpen, setRangeTaskModalOpen] = useState(false);
  const [rangeTaskTitle, setRangeTaskTitle] = useState('');
  const [rangeTaskPriority, setRangeTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  
  // 任务详情悬浮框
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [popoverDate, setPopoverDate] = useState<Dayjs | null>(null);
  
  // 日期所有任务查看
  const [allTasksModalOpen, setAllTasksModalOpen] = useState(false);
  const [allTasksDate, setAllTasksDate] = useState<Dayjs | null>(null);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getTodos();
      if (response.success && response.data) {
        setTodos(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTodosForDate = (date: Dayjs) => {
    return todos.filter(todo => {
      if (!todo.dueDate) return false;
      return dayjs(todo.dueDate).isSame(date, 'day');
    });
  };

  const handleMouseDown = (date: Dayjs) => {
    isSelecting.current = true;
    setDateRange({ start: date, end: null });
  };

  const handleMouseEnter = (date: Dayjs) => {
    if (!isSelecting.current || !dateRange.start) return;
    if (date.isSame(dateRange.start, 'month')) {
      setDateRange(prev => ({ ...prev, end: date }));
    }
  };

  const handleMouseUp = () => {
    if (!isSelecting.current) return;
    isSelecting.current = false;

    if (dateRange.start && dateRange.end) {
      setRangeTaskModalOpen(true);
    } else if (dateRange.start) {
      // 单日选择
      setDateRange({ start: null, end: null });
    }
  };

  const handleCreateRangeTask = async () => {
    if (!rangeTaskTitle.trim() || !dateRange.start || !dateRange.end) {
      toast.error('请填写任务标题和选择日期范围');
      return;
    }

    const start = dateRange.start.isBefore(dateRange.end)
      ? dateRange.start
      : dateRange.end;
    const end = dateRange.start.isBefore(dateRange.end)
      ? dateRange.end
      : dateRange.start;

    // 为范围内的每个日期创建任务
    try {
      let current = start;
      const newTodos: Todo[] = [];
      
      while (current.isSameOrBefore(end, 'day')) {
        const response = await apiClient.createTodo({
          title: rangeTaskTitle,
          description: '',
          priority: rangeTaskPriority,
          dueDate: current.format('YYYY-MM-DD'),
          completed: false,
        });
        if (response.success && response.data) {
          newTodos.push(response.data);
        }
        current = current.add(1, 'day');
      }

      setTodos([...todos, ...newTodos]);
      setRangeTaskModalOpen(false);
      setRangeTaskTitle('');
      setRangeTaskPriority('medium');
      setDateRange({ start: null, end: null });
      toast.success(`已创建 ${newTodos.length} 个任务`);
    } catch (error) {
      console.error('Failed to create range tasks:', error);
      toast.error('创建任务失败');
    }
  };

  const isDateInRange = (date: Dayjs) => {
    if (!dateRange.start) return false;
    const start = dateRange.start;
    const end = dateRange.end || dateRange.start;
    const actualStart = start.isBefore(end) ? start : end;
    const actualEnd = start.isBefore(end) ? end : start;
    return date.isSame(actualStart, 'day') ||
           date.isSame(actualEnd, 'day') ||
           (date.isAfter(actualStart.subtract(1, 'day')) && date.isBefore(actualEnd.add(1, 'day')));
  };

  const handlePanelChange = (date: Dayjs) => {
    currentMonth.current = date;
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
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>日历</h1>
        <p style={{ margin: '4px 0 0', color: '#8c8c8c' }}>查看和规划你的任务 {dateRange.start && dateRange.end ? `(已选择 ${dateRange.start.format('MM-DD')} 至 ${dateRange.end.format('MM-DD')})` : ''}</p>
      </div>

      <Card>
        <Calendar
          onPanelChange={handlePanelChange}
          onSelect={setSelectedDate}
          cellRender={(date: Dayjs, info) => {
            if (info.type === 'date') {
              const todosForDate = getTodosForDate(date);
              const isSelected = date.isSame(selectedDate, 'day');
              const inRange = isDateInRange(date);
              const isCurrentMonth = date.month() === currentMonth.current.month();
              const displayTodos = todosForDate.slice(0, 3);
              const extraCount = todosForDate.length - 3;

              const todoList = (
                <div style={{ maxWidth: '200px' }}>
                  {todosForDate.map(todo => (
                    <Popover
                      key={todo.id}
                      content={
                        <div style={{ width: '280px' }}>
                          <div style={{ marginBottom: '12px' }}>
                            <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px', color: '#262626' }}>
                              {todo.title}
                            </div>
                            {todo.description && (
                              <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '8px' }}>
                                {todo.description}
                              </div>
                            )}
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '12px', color: '#1677ff' }}>优先级: {
                                todo.priority === 'high' ? '高' :
                                todo.priority === 'medium' ? '中' : '低'
                              }</span>
                              {todo.dueDate && (
                                <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
                                  {dayjs(todo.dueDate).format('MM月DD日')}
                                </span>
                              )}
                            </div>
                          </div>
                          <Divider style={{ margin: '8px 0' }} />
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <Button
                              size="small"
                              type={todo.completed ? 'default' : 'primary'}
                              onClick={async () => {
                                const response = await apiClient.updateTodo(todo.id, {
                                  ...todo,
                                  completed: !todo.completed,
                                });
                                if (response.success) {
                                  setTodos(todos.map(t => t.id === todo.id ? { ...t, completed: !t.completed } : t));
                                  toast.success(todo.completed ? '标记未完成' : '标记完成');
                                }
                              }}
                            >
                              {todo.completed ? '未完成' : '完成'}
                            </Button>
                          </div>
                        </div>
                      }
                      title={null}
                      trigger="click"
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '2px 4px',
                          marginBottom: '2px',
                          background: todo.completed ? '#f6ffed' : '#fff',
                          borderRadius: '3px',
                          fontSize: '12px',
                          borderLeft: `3px solid ${
                            todo.priority === 'high'
                              ? '#EF4444'
                              : todo.priority === 'medium'
                              ? '#3B82F6'
                              : '#10B981'
                          }`,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          cursor: 'pointer',
                          textDecoration: todo.completed ? 'line-through' : 'none',
                          color: todo.completed ? '#bfbfbf' : '#262626',
                        }}
                      >
                        {todo.title}
                      </div>
                    </Popover>
                  ))}
                  {extraCount > 0 && (
                    <div
                      onClick={() => {
                        setAllTasksDate(date);
                        setAllTasksModalOpen(true);
                      }}
                      style={{
                        textAlign: 'center',
                        padding: '4px',
                        color: '#1677ff',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 500,
                      }}
                    >
                      +{extraCount} 更多
                    </div>
                  )}
                </div>
              );

              return (
                <div
                  onMouseDown={() => handleMouseDown(date)}
                  onMouseEnter={() => handleMouseEnter(date)}
                  onMouseUp={handleMouseUp}
                  style={{
                    height: '100%',
                    padding: '4px',
                    background: isSelected
                      ? '#e6f4ff'
                      : inRange
                      ? '#bae0ff'
                      : 'transparent',
                    borderRadius: '4px',
                    opacity: isCurrentMonth ? 1 : 0.3,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <Text
                      style={{
                        fontWeight: date.isSame(dayjs(), 'day') ? 600 : 400,
                        color: date.isSame(dayjs(), 'day') ? '#1677ff' : '#262626',
                      }}
                    >
                      {date.date()}
                    </Text>
                  </div>
                  <div style={{ marginTop: '4px' }}>
                    {todosForDate.length > 0 ? (
                      <Popover
                        content={todoList}
                        title={null}
                        trigger="hover"
                        placement="rightTop"
                      >
                        <div>
                          {displayTodos.map(todo => (
                            <div
                              key={todo.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '2px 4px',
                                marginBottom: '2px',
                                background: todo.completed ? '#f6ffed' : '#fff',
                                borderRadius: '3px',
                                fontSize: '12px',
                                borderLeft: `3px solid ${
                                  todo.priority === 'high'
                                    ? '#EF4444'
                                    : todo.priority === 'medium'
                                    ? '#3B82F6'
                                    : '#10B981'
                                }`,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                textDecoration: todo.completed ? 'line-through' : 'none',
                                color: todo.completed ? '#bfbfbf' : '#262626',
                              }}
                            >
                              {todo.title}
                            </div>
                          ))}
                          {extraCount > 0 && (
                            <div style={{
                              textAlign: 'center',
                              padding: '4px',
                              color: '#1677ff',
                              fontSize: '12px',
                              fontWeight: 500,
                              cursor: 'pointer',
                            }}>
                              +{extraCount}
                            </div>
                          )}
                        </div>
                      </Popover>
                    ) : null}
                  </div>
                </div>
              );
            }
            return info.originNode;
          }}
        />
      </Card>

      {/* 时间段任务创建弹框 */}
      <Modal
        title="创建时间段任务"
        open={rangeTaskModalOpen}
        onCancel={() => {
          setRangeTaskModalOpen(false);
          setDateRange({ start: null, end: null });
        }}
        onOk={handleCreateRangeTask}
        okText="创建"
        cancelText="取消"
        centered
        width={420}
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8, color: '#8c8c8c', fontSize: '12px' }}>
            时间范围：{dateRange.start?.format('YYYY-MM-DD')} 至 {dateRange.end?.format('YYYY-MM-DD')}
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8, color: '#8c8c8c' }}>任务标题</div>
          <Input
            value={rangeTaskTitle}
            onChange={(e) => setRangeTaskTitle(e.target.value)}
            placeholder="输入任务标题"
            autoFocus
          />
        </div>
        <div>
          <div style={{ marginBottom: 8, color: '#8c8c8c' }}>优先级</div>
          <Select
            value={rangeTaskPriority}
            onChange={setRangeTaskPriority}
            style={{ width: '100%' }}
            options={[
              { label: '低优先级', value: 'low' },
              { label: '中优先级', value: 'medium' },
              { label: '高优先级', value: 'high' },
            ]}
          />
        </div>
      </Modal>

      {/* 查看该日期所有任务弹框 */}
      <Modal
        title={allTasksDate ? `${allTasksDate.format('YYYY年MM月DD日')} 的任务` : '任务列表'}
        open={allTasksModalOpen}
        onCancel={() => setAllTasksModalOpen(false)}
        footer={null}
        centered
        width={500}
      >
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {allTasksDate && getTodosForDate(allTasksDate).map(todo => (
            <div
              key={todo.id}
              style={{
                padding: '12px',
                marginBottom: '8px',
                border: '1px solid #f0f0f0',
                borderRadius: '4px',
                borderLeft: `4px solid ${
                  todo.priority === 'high'
                    ? '#EF4444'
                    : todo.priority === 'medium'
                    ? '#3B82F6'
                    : '#10B981'
                }`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: todo.completed ? '#bfbfbf' : '#262626',
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    marginBottom: '8px',
                  }}>
                    {todo.title}
                  </div>
                  {todo.description && (
                    <div style={{
                      fontSize: '12px',
                      color: '#8c8c8c',
                      marginBottom: '8px',
                      whiteSpace: 'pre-wrap',
                    }}>
                      {todo.description}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#1677ff' }}>
                      {todo.priority === 'high' ? '🔴 高' :
                       todo.priority === 'medium' ? '🟠 中' : '🟢 低'}
                    </span>
                  </div>
                </div>
                <Button
                  size="small"
                  type={todo.completed ? 'default' : 'primary'}
                  onClick={async () => {
                    const response = await apiClient.updateTodo(todo.id, {
                      ...todo,
                      completed: !todo.completed,
                    });
                    if (response.success) {
                      setTodos(todos.map(t => t.id === todo.id ? { ...t, completed: !t.completed } : t));
                      toast.success(todo.completed ? '标记未完成' : '标记完成');
                    }
                  }}
                >
                  {todo.completed ? '未完成' : '完成'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default CalendarPage;
