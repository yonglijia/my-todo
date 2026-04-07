import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Divider, Button, Spin } from 'antd';
import { InboxOutlined, CalendarOutlined, StarOutlined, CheckCircleOutlined, SettingOutlined, PlusOutlined, FolderOutlined, TagOutlined } from '@ant-design/icons';
import { TodoList, Tag } from '../types';
import { apiClient } from '../utils/api';

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = () => {
  const location = useLocation();
  const [lists, setLists] = useState<TodoList[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListsAndTags();
  }, []);

  const fetchListsAndTags = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { icon: InboxOutlined, label: '收集箱', path: '/' },
    { icon: CalendarOutlined, label: '今天', path: '/today' },
    { icon: StarOutlined, label: '明天', path: '/tomorrow' },
    { icon: CheckCircleOutlined, label: '已完成', path: '/completed' },
  ];

  if (loading) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin />
      </div>
    );
  }

  return (
    <div style={{ height: '100%', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px' }}>
        <div style={{ padding: '0 12px 8px', fontSize: '12px', fontWeight: 600, color: '#8c8c8c', textTransform: 'uppercase' }}>
          智能清单
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{ border: 'none' }}
          items={menuItems.map(item => ({
            key: item.path,
            icon: <item.icon />,
            label: <Link to={item.path}>{item.label}</Link>,
          }))}
        />
      </div>

      <div style={{ padding: '12px', flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 12px 8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#8c8c8c', textTransform: 'uppercase' }}>清单</span>
          <Button type="text" size="small" icon={<PlusOutlined />} />
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{ border: 'none' }}
          items={lists.map(list => ({
            key: `/list/${list.id}`,
            icon: <FolderOutlined style={{ color: list.color }} />,
            label: <Link to={`/list/${list.id}`}>{list.name}</Link>,
          }))}
        />

        <Divider style={{ margin: '12px 0' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 12px 8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#8c8c8c', textTransform: 'uppercase' }}>标签</span>
          <Button type="text" size="small" icon={<PlusOutlined />} />
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{ border: 'none' }}
          items={tags.map(tag => ({
            key: `/tag/${tag.id}`,
            icon: <TagOutlined style={{ color: tag.color }} />,
            label: <Link to={`/tag/${tag.id}`}>{tag.name}</Link>,
          }))}
        />
      </div>

      <div style={{ padding: '12px', borderTop: '1px solid #f0f0f0' }}>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{ border: 'none' }}
          items={[
            {
              key: '/settings',
              icon: <SettingOutlined />,
              label: <Link to="/settings">设置</Link>,
            },
          ]}
        />
      </div>
    </div>
  );
};

export default Sidebar;
