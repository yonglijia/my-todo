import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Badge, Button } from 'antd';
import { CalendarOutlined, CheckSquareOutlined, SearchOutlined, BellOutlined, UserOutlined, RocketOutlined } from '@ant-design/icons';
import SearchModal from './SearchModal';

const { Header: AntHeader } = Layout;

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = () => {
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);

  // 监听全局快捷键 Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
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
                background: 'linear-gradient(135deg, #1677ff 0%, #13c2c2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RocketOutlined style={{ color: '#fff', fontSize: '18px' }} />
            </div>
            <span style={{ fontSize: '18px', fontWeight: 600, color: '#262626' }}>TaskFlow</span>
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
          <Button type="text" icon={<SearchOutlined />} onClick={() => setSearchOpen(true)}>
            <span style={{ marginLeft: 4, color: '#8c8c8c', fontSize: 12 }}>⌘K</span>
          </Button>
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

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Header;
