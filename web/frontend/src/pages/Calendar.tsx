import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Card, Badge, Spin, Typography } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { Todo } from '../types';
import { apiClient } from '../utils/api';

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
      const start = dateRange.start.isBefore(dateRange.end)
        ? dateRange.start
        : dateRange.end;
      const end = dateRange.start.isBefore(dateRange.end)
        ? dateRange.end
        : dateRange.start;
      const todosInRange = todos.filter(todo => {
        if (!todo.dueDate) return false;
        const dueDate = dayjs(todo.dueDate);
        return dueDate.isAfter(start.subtract(1, 'day')) && dueDate.isBefore(end.add(1, 'day'));
      });
      console.log('Todos in range:', todosInRange);
    }
    setDateRange({ start: null, end: null });
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
        <p style={{ margin: '4px 0 0', color: '#8c8c8c' }}>查看和规划你的任务</p>
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
                        color: date.isSame(dayjs(), 'day') ? '#4A90E2' : '#262626',
                      }}
                    >
                      {date.date()}
                    </Text>
                  </div>
                  <div style={{ marginTop: '4px' }}>
                    {todosForDate.slice(0, 2).map(todo => (
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
                        }}
                      >
                        {todo.title}
                      </div>
                    ))}
                    {todosForDate.length > 2 && (
                      <div style={{ textAlign: 'center', marginTop: '4px' }}>
                        <Badge count={todosForDate.length - 2} size="small" />
                      </div>
                    )}
                  </div>
                </div>
              );
            }
            return info.originNode;
          }}
        />
      </Card>
    </div>
  );
};

export default CalendarPage;
