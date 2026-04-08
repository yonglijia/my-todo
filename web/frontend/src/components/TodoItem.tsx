import React, { useRef } from 'react';
import { Tag, Button, Checkbox, Space, Input, Popover, Select, DatePicker } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Todo, TodoList, Tag as TagType } from '../types';
import { formatDate } from '../utils/dateUtils';
import dayjs from 'dayjs';

interface TodoItemProps {
  todo: Todo;
  lists: TodoList[];
  tags: TagType[];
  onToggleComplete: (todo: Todo, e: React.MouseEvent) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onFieldChange: (todoId: string, field: string, value: any) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  lists,
  tags,
  onToggleComplete,
  onDelete,
  onEdit,
  onFieldChange,
}) => {
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

  const getListInfo = (listId?: string) => {
    return lists.find(l => l.id === listId);
  };

  const getTagsInfo = (tagIds?: string[]) => {
    if (!tagIds) return [];
    return tags.filter(t => tagIds.includes(t.id));
  };

  const listInfo = getListInfo(todo.listId);
  const tagsInfo = getTagsInfo(todo.tags);

  return (
    <div
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
        onClick={(e) => onToggleComplete(todo, e)}
        style={{ marginTop: '2px', marginRight: '12px', marginLeft: '0px', flexShrink: 0 }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* 标题 - 直接可编辑 */}
        <Input
          value={todo.title}
          onChange={(e) => onFieldChange(todo.id, 'title', e.target.value)}
          disabled={todo.completed}
          placeholder="输入任务标题"
          variant="borderless"
          style={{
            textDecoration: todo.completed ? 'line-through' : 'none',
            color: todo.completed ? '#8c8c8c' : '#404040',
            marginBottom: '4px',
            fontSize: '14px',
            fontWeight: 500,
            padding: '2px 4px',
            cursor: todo.completed ? 'default' : 'text',
          }}
        />

        {/* 描述 - 直接可编辑 */}
        <Input.TextArea
          value={todo.description || ''}
          onChange={(e) => onFieldChange(todo.id, 'description', e.target.value || undefined)}
          disabled={todo.completed}
          placeholder="输入任务描述"
          rows={1}
          variant="borderless"
          style={{
            color: todo.completed ? '#8c8c8c' : '#8c8c8c',
            fontSize: '14px',
            marginBottom: '8px',
            padding: '2px 4px',
            cursor: todo.completed ? 'default' : 'text',
          }}
        />

        {/* 日期、时间、优先级编辑 */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <Popover
            content={
              <DatePicker
                value={todo.dueDate ? dayjs(todo.dueDate) : null}
                onChange={(date) => {
                  const dateStr = date ? dayjs(date).format('YYYY-MM-DD') : undefined;
                  onFieldChange(todo.id, 'dueDate', dateStr);
                }}
                style={{ width: '100%' }}
              />
            }
            title="选择截止日期"
            trigger="click"
          >
            <Tag
              icon={<CalendarOutlined />}
              style={{ cursor: todo.completed ? 'default' : 'pointer', marginBottom: '0' }}
            >
              {todo.dueDate ? formatDate(todo.dueDate, 'MM月dd日') : '添加日期'}
            </Tag>
          </Popover>

          <Popover
            content={
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '200px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '4px', display: 'block' }}>
                    开始时间
                  </label>
                  <Input
                    value={todo.startTime || ''}
                    onChange={(e) => onFieldChange(todo.id, 'startTime', e.target.value || undefined)}
                    placeholder="09:00"
                    type="text"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '4px', display: 'block' }}>
                    结束时间
                  </label>
                  <Input
                    value={todo.endTime || ''}
                    onChange={(e) => onFieldChange(todo.id, 'endTime', e.target.value || undefined)}
                    placeholder="17:00"
                    type="text"
                  />
                </div>
              </div>
            }
            title="设置时间"
            trigger="click"
          >
            <Tag
              icon={<ClockCircleOutlined />}
              style={{ cursor: todo.completed ? 'default' : 'pointer', marginBottom: '0' }}
            >
              {todo.startTime ? `${todo.startTime}${todo.endTime ? ` - ${todo.endTime}` : ''}` : '添加时间'}
            </Tag>
          </Popover>

          <Popover
            content={
              <Select
                value={todo.priority}
                onChange={(value) => onFieldChange(todo.id, 'priority', value)}
                options={[
                  { label: '低', value: 'low' },
                  { label: '中', value: 'medium' },
                  { label: '高', value: 'high' },
                ]}
                style={{ width: '150px' }}
              />
            }
            title="选择优先级"
            trigger="click"
          >
            {getPriorityTag(todo.priority)}
          </Popover>

          {listInfo && <Tag color={listInfo.color}>{listInfo.name}</Tag>}
          {tagsInfo.map(tag => (
            <Tag key={tag.id} color={tag.color}>
              {tag.name}
            </Tag>
          ))}
        </div>
      </div>
      <Space>
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() => onEdit(todo)}
        />
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => onDelete(todo.id)}
        />
      </Space>
    </div>
  );
};

export default TodoItem;
