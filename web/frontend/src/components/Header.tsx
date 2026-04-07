import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Badge, Button } from 'antd';
import { CalendarOutlined, CheckSquareOutlined, SearchOutlined, BellOutlined, UserOutlined } from '@ant-design/icons';

const { Header: AntHeader } = Layout;

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = () => {
  const location = useLocation();

  return (
    <AntHeader
      style={{
        background: '#fff',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0',
        position: 'fixed',
        width: '100%',
        zIndex: 1000,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckSquareOutlined style={{ color: '#fff', fontSize: '18px' }} />
          </div>
          <span style={{ fontSize: '18px', fontWeight: 600, color: '#262626' }}>滴答清单</span>
        </Link>
      </div>

      <Menu
        mode="horizontal"
        selectedKeys={[location.pathname]}
        style={{ border: 'none', flex: 1, justifyContent: 'center' }}
        items={[
          {
            key: '/',
            icon: <CheckSquareOutlined />,
            label: <Link to="/">任务</Link>,
          },
          {
            key: '/calendar',
            icon: <CalendarOutlined />,
            label: <Link to="/calendar">日历</Link>,
          },
        ]}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Button type="text" icon={<SearchOutlined />} />
        <Badge count={3} size="small">
          <Button type="text" icon={<BellOutlined />} />
        </Badge>
        <Avatar
          size="small"
          icon={<UserOutlined />}
          style={{ marginLeft: '8px', cursor: 'pointer' }}
        />
      </div>
    </AntHeader>
  );
};

export default Header;
