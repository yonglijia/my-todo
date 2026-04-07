import React, { useState, useEffect } from 'react';
import { Modal, Input, Select, DatePicker, Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import {
  HomeOutlined, BookOutlined, HeartOutlined, ShopOutlined, CarOutlined,
  CreditCardOutlined, GiftOutlined, TrophyOutlined, TeamOutlined, RocketOutlined, BulbOutlined,
  CloudOutlined, CoffeeOutlined, ExperimentOutlined, FireOutlined, GlobalOutlined, FlagOutlined,
  FundOutlined, KeyOutlined, LikeOutlined, MedicineBoxOutlined, PhoneOutlined, PrinterOutlined,
  SafetyOutlined, SoundOutlined, ThunderboltOutlined, ToolOutlined, WalletOutlined, EnvironmentOutlined, FolderOutlined
} from '@ant-design/icons';
import { Todo, TodoList, Tag as TagType } from '../types';
import { apiClient } from '../utils/api';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

interface TodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (todo: Todo) => void;
  todo?: Todo | null;
  defaultDueDate?: string; // 默认到期日期
}

// 图标映射
const iconMap: Record<string, React.ComponentType<any>> = {
  HomeOutlined, BookOutlined, HeartOutlined, ShopOutlined, CarOutlined,
  CreditCardOutlined, GiftOutlined, TrophyOutlined, TeamOutlined, RocketOutlined, BulbOutlined,
  CloudOutlined, CoffeeOutlined, ExperimentOutlined, FireOutlined, GlobalOutlined, FlagOutlined,
  FundOutlined, KeyOutlined, LikeOutlined, MedicineBoxOutlined, PhoneOutlined, PrinterOutlined,
  SafetyOutlined, SoundOutlined, ThunderboltOutlined, ToolOutlined, WalletOutlined, EnvironmentOutlined,
};

const getIconComponent = (iconName?: string) => {
  if (!iconName) return FolderOutlined;
  return iconMap[iconName] || FolderOutlined;
};

const TodoModal: React.FC<TodoModalProps> = ({ isOpen, onClose, onSave, todo, defaultDueDate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('high');
  const [dueDate, setDueDate] = useState<dayjs.Dayjs | null>(dayjs());
  const [startTime, setStartTime] = useState<dayjs.Dayjs | null>(dayjs());
  const [endTime, setEndTime] = useState<dayjs.Dayjs | null>(null);
  const [listId, setListId] = useState<string | undefined>();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [lists, setLists] = useState<TodoList[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [showMore, setShowMore] = useState(false);
  const [showNewList, setShowNewList] = useState(false);
  const [showNewTag, setShowNewTag] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newTagName, setNewTagName] = useState('');

  useEffect(() => {
    fetchListsAndTags();
  }, []);

  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setDescription(todo.description || '');
      setPriority(todo.priority);
      setDueDate(todo.dueDate ? dayjs(todo.dueDate) : null);
      setStartTime(todo.startTime ? dayjs(todo.startTime, 'HH:mm') : null);
      setEndTime(todo.endTime ? dayjs(todo.endTime, 'HH:mm') : null);
      setListId(todo.listId);
      setSelectedTags(todo.tags || []);
      setShowMore(true);
    } else {
      setTitle('');
      setDescription('');
      setPriority('high');
      setDueDate(defaultDueDate ? dayjs(defaultDueDate) : dayjs());
      setStartTime(dayjs());
      setEndTime(null);
      setListId(undefined);
      setSelectedTags([]);
      setShowMore(false);
    }
  }, [todo, isOpen, defaultDueDate]);

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

  const handleAddNewList = async () => {
    if (newListName.trim()) {
      const colors = ['#1677ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#eb2f96'];
      const color = colors[lists.length % colors.length];
      const response = await apiClient.createList(newListName, color);
      if (response.success && response.data) {
        setLists([...lists, response.data]);
        setListId(response.data.id);
        setNewListName('');
        setShowNewList(false);
        toast.success('清单已创建');
      } else {
        toast.error(response.error || '创建失败');
      }
    }
  };

  const handleAddNewTag = async () => {
    if (newTagName.trim()) {
      const response = await apiClient.createTag(newTagName, '#f5222d');
      if (response.success && response.data) {
        setTags([...tags, response.data]);
        setSelectedTags([...selectedTags, response.data.id]);
        setNewTagName('');
        setShowNewTag(false);
        toast.success('标签已创建');
      } else {
        toast.error(response.error || '创建失败');
      }
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('请输入任务标题');
      return;
    }

    setLoading(true);

    const todoData = {
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate: dueDate ? dueDate.format('YYYY-MM-DD') : '',
      startTime: startTime ? startTime.format('HH:mm') : '',
      endTime: endTime ? endTime.format('HH:mm') : '',
      listId,
      tags: selectedTags,
    };

    try {
      let response;
      if (todo) {
        response = await apiClient.updateTodo(todo.id, todoData);
      } else {
        response = await apiClient.createTodo(todoData);
      }

      if (response.success && response.data) {
        onSave(response.data);
        handleClose();
      } else {
        toast.error(response.error || '保存失败');
      }
    } catch (error) {
      toast.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // 优先级纯色圆点 - 优化颜色
  const priorityOptions = [
    {
      value: 'high',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff4d4f' }} />
          高优先
        </span>
      ),
    },
    {
      value: 'medium',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1677ff' }} />
          中优先
        </span>
      ),
    },
    {
      value: 'low',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#52c41a' }} />
          低优先
        </span>
      ),
    },
  ];

  return (
    <Modal
      title={null}
      open={isOpen}
      onCancel={handleClose}
      footer={null}
      width={520}
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
      {/* 标题输入区 */}
      <div style={{ padding: '20px 20px 0' }}>
        <Input
          placeholder="添加任务..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          variant="borderless"
          style={{
            fontSize: 18,
            fontWeight: 500,
            padding: 0,
          }}
          autoFocus
        />
      </div>

      {/* 备注输入区 */}
      <div style={{ padding: '8px 20px 12px' }}>
        <Input.TextArea
          placeholder="添加备注..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          variant="borderless"
          style={{
            fontSize: 14,
            color: '#8c8c8c',
            padding: 0,
            resize: 'none',
          }}
          rows={1}
        />
      </div>

      {/* 快捷操作栏 */}
      <div style={{
        padding: '8px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
        borderTop: '1px solid #f0f0f0',
        borderBottom: showMore ? '1px solid #f0f0f0' : 'none',
      }}>
        {/* 优先级 */}
        <Select
          value={priority}
          onChange={setPriority}
          size="small"
          variant="borderless"
          style={{ width: 90 }}
          options={priorityOptions}
        />

        {/* 日期 */}
        <DatePicker
          value={dueDate}
          onChange={setDueDate}
          size="small"
          variant="borderless"
          style={{ width: 110 }}
          placeholder="日期"
          format="MM月DD日"
          suffixIcon={null}
        />

        {/* 时间 */}
        <Select
          value={startTime ? startTime.format('HH:mm') : undefined}
          onChange={(val) => setStartTime(val ? dayjs(val, 'HH:mm') : null)}
          size="small"
          variant="borderless"
          style={{ width: 85 }}
          placeholder="时间"
          allowClear
          options={Array.from({ length: 24 * 4 }, (_, i) => {
            const hour = Math.floor(i / 4);
            const minute = (i % 4) * 15;
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            return { value: time, label: time };
          })}
        />

        {/* 更多选项按钮 */}
        <Button
          type="text"
          size="small"
          onClick={() => setShowMore(!showMore)}
          style={{ color: '#8c8c8c', padding: '0 8px' }}
        >
          {showMore ? '收起' : '更多'}
        </Button>
      </div>

      {/* 更多选项 */}
      {showMore && (
        <div style={{ padding: '12px 20px', background: '#fafafa' }}>
          {/* 清单和标签一行 */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            {/* 清单 */}
            <Select
              value={listId}
              onChange={setListId}
              size="small"
              style={{ flex: 1 }}
              placeholder="清单"
              allowClear
              variant="borderless"
              dropdownRender={(menu) => (
                <>
                  {menu}
                  {showNewList ? (
                    <Space style={{ padding: '8px' }}>
                      <Input
                        placeholder="名称"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        style={{ width: 120 }}
                        size="small"
                        autoFocus
                      />
                      <Button type="primary" size="small" onClick={handleAddNewList}>
                        添加
                      </Button>
                    </Space>
                  ) : (
                    <Button
                      type="text"
                      icon={<PlusOutlined />}
                      size="small"
                      style={{ width: '100%', textAlign: 'left' }}
                      onClick={() => setShowNewList(true)}
                    >
                      新建清单
                    </Button>
                  )}
                </>
              )}
              options={lists.map(list => {
                const IconComponent = getIconComponent(list.icon);
                return {
                  value: list.id,
                  label: (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <IconComponent style={{ color: list.color, fontSize: 14 }} />
                      {list.name}
                    </span>
                  ),
                };
              })}
            />

            {/* 标签 */}
            <Select
              mode="multiple"
              value={selectedTags}
              onChange={setSelectedTags}
              size="small"
              style={{ flex: 1 }}
              placeholder="标签"
              variant="borderless"
              dropdownRender={(menu) => (
                <>
                  {menu}
                  {showNewTag ? (
                    <Space style={{ padding: '8px' }}>
                      <Input
                        placeholder="名称"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        style={{ width: 120 }}
                        size="small"
                        autoFocus
                      />
                      <Button type="primary" size="small" onClick={handleAddNewTag}>
                        添加
                      </Button>
                    </Space>
                  ) : (
                    <Button
                      type="text"
                      icon={<PlusOutlined />}
                      size="small"
                      style={{ width: '100%', textAlign: 'left' }}
                      onClick={() => setShowNewTag(true)}
                    >
                      新建标签
                    </Button>
                  )}
                </>
              )}
              options={tags.map(tag => ({
                value: tag.id,
                label: (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ color: '#f5222d', fontWeight: 600 }}>#</span>
                    {tag.name}
                  </span>
                ),
              }))}
            />
          </div>

          {/* 结束时间单独一行 */}
          <Select
            value={endTime ? endTime.format('HH:mm') : undefined}
            onChange={(val) => setEndTime(val ? dayjs(val, 'HH:mm') : null)}
            size="small"
            style={{ width: '100%' }}
            placeholder="结束时间"
            allowClear
            variant="borderless"
            options={Array.from({ length: 24 * 4 }, (_, i) => {
              const hour = Math.floor(i / 4);
              const minute = (i % 4) * 15;
              const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
              return { value: time, label: time };
            })}
          />
        </div>
      )}

      {/* 底部操作按钮 */}
      <div style={{
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 8,
        borderTop: '1px solid #f0f0f0',
      }}>
        <Button onClick={handleClose}>
          取消
        </Button>
        <Button type="primary" onClick={handleSubmit} loading={loading}>
          {todo ? '更新' : '添加'}
        </Button>
      </div>
    </Modal>
  );
};

export default TodoModal;
