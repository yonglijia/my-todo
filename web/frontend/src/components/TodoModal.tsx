import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, TimePicker, Tag, Button, Space, Divider } from 'antd';
import { PlusOutlined, FlagOutlined, FolderOutlined, TagOutlined } from '@ant-design/icons';
import { Todo, TodoList, Tag as TagType } from '../types';
import { apiClient } from '../utils/api';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

interface TodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (todo: Todo) => void;
  todo?: Todo | null;
}

const TodoModal: React.FC<TodoModalProps> = ({ isOpen, onClose, onSave, todo }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [showNewList, setShowNewList] = useState(false);
  const [showNewTag, setShowNewTag] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [lists, setLists] = useState<TodoList[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);

  useEffect(() => {
    fetchListsAndTags();
  }, []);

  useEffect(() => {
    if (todo) {
      form.setFieldsValue({
        title: todo.title,
        description: todo.description,
        priority: todo.priority,
        dueDate: todo.dueDate ? dayjs(todo.dueDate) : dayjs(),
        startTime: todo.startTime ? dayjs(todo.startTime, 'HH:mm') : dayjs(),
        endTime: todo.endTime ? dayjs(todo.endTime, 'HH:mm') : null,
        listId: todo.listId,
        tags: todo.tags || [],
      });
    } else {
      form.setFieldsValue({
        title: '',
        description: '',
        priority: 'high',
        dueDate: dayjs(),
        startTime: dayjs(),
        endTime: null,
        listId: undefined,
        tags: [],
      });
    }
  }, [todo, isOpen, form]);

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
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
      const color = colors[lists.length % colors.length];
      const response = await apiClient.createList(newListName, color);
      if (response.success && response.data) {
        setLists([...lists, response.data]);
        form.setFieldValue('listId', response.data.id);
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
      const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];
      const color = colors[tags.length % colors.length];
      const response = await apiClient.createTag(newTagName, color);
      if (response.success && response.data) {
        setTags([...tags, response.data]);
        const currentTags = form.getFieldValue('tags') || [];
        form.setFieldValue('tags', [...currentTags, response.data.id]);
        setNewTagName('');
        setShowNewTag(false);
        toast.success('标签已创建');
      } else {
        toast.error(response.error || '创建失败');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      setLoading(true);

      const todoData = {
        title: values.title,
        description: values.description || '',
        priority: values.priority,
        dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : '',
        startTime: values.startTime ? values.startTime.format('HH:mm') : '',
        endTime: values.endTime ? values.endTime.format('HH:mm') : '',
        listId: values.listId,
        tags: values.tags || [],
      };

      let response;
      if (todo) {
        response = await apiClient.updateTodo(todo.id, todoData);
      } else {
        response = await apiClient.createTodo(todoData);
      }

      if (response.success && response.data) {
        onSave(response.data);
        form.resetFields();
      } else {
        toast.error(response.error || '保存失败');
      }
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={todo ? '编辑任务' : '新建任务'}
      open={isOpen}
      onCancel={handleClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={600}
      okText={todo ? '更新' : '添加'}
      cancelText="取消"
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          priority: 'high',
          dueDate: dayjs(),
          startTime: dayjs(),
        }}
      >
        <Form.Item
          name="title"
          label="任务标题"
          rules={[{ required: true, message: '请输入任务标题' }]}
        >
          <Input placeholder="输入任务标题" autoFocus />
        </Form.Item>

        <Form.Item
          name="description"
          label="描述"
        >
          <TextArea rows={2} placeholder="添加描述（可选）" />
        </Form.Item>

        <Form.Item
          name="priority"
          label={<><FlagOutlined /> 优先级</>}
        >
          <Select>
            <Option value="high">
              <Tag color="red">高</Tag>
            </Option>
            <Option value="medium">
              <Tag color="blue">中</Tag>
            </Option>
            <Option value="low">
              <Tag color="green">低</Tag>
            </Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="listId"
          label={<><FolderOutlined /> 清单</>}
        >
          <Select
            placeholder="选择清单"
            allowClear
            dropdownRender={(menu) => (
              <>
                {menu}
                <Divider style={{ margin: '8px 0' }} />
                {showNewList ? (
                  <Space style={{ padding: '8px' }}>
                    <Input
                      placeholder="清单名称"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      style={{ width: 150 }}
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
                    style={{ width: '100%', textAlign: 'left' }}
                    onClick={() => setShowNewList(true)}
                  >
                    新建清单
                  </Button>
                )}
              </>
            )}
          >
            {lists.map(list => (
              <Option key={list.id} value={list.id}>
                <Tag color={list.color}>{list.name}</Tag>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="tags"
          label={<><TagOutlined /> 标签</>}
        >
          <Select
            mode="multiple"
            placeholder="选择标签"
            allowClear
            dropdownRender={(menu) => (
              <>
                {menu}
                <Divider style={{ margin: '8px 0' }} />
                {showNewTag ? (
                  <Space style={{ padding: '8px' }}>
                    <Input
                      placeholder="标签名称"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      style={{ width: 120 }}
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
                    style={{ width: '100%', textAlign: 'left' }}
                    onClick={() => setShowNewTag(true)}
                  >
                    新建标签
                  </Button>
                )}
              </>
            )}
          >
            {tags.map(tag => (
              <Option key={tag.id} value={tag.id}>
                <Tag color={tag.color}>{tag.name}</Tag>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="dueDate"
          label="截止日期"
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="时间">
          <Space>
            <Form.Item name="startTime" noStyle>
              <TimePicker
                format="HH:mm"
                minuteStep={15}
                placeholder="开始时间"
                style={{ width: 140 }}
              />
            </Form.Item>
            <span>至</span>
            <Form.Item name="endTime" noStyle>
              <TimePicker
                format="HH:mm"
                minuteStep={15}
                placeholder="结束时间"
                style={{ width: 140 }}
              />
            </Form.Item>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TodoModal;
