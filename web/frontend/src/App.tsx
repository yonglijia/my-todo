import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout, Button } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TodoListPage from './pages/TodoList';
import CalendarPage from './pages/Calendar';
import ListPage from './pages/ListPage';
import TagPage from './pages/TagPage';

const { Sider, Content } = Layout;

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <Layout style={{ marginTop: 64 }}>
        <Sider
          width={256}
          collapsible
          collapsed={!sidebarOpen}
          trigger={null}
          style={{
            background: '#fff',
            borderRight: '1px solid #f0f0f0',
            overflow: 'auto',
            height: 'calc(100vh - 64px)',
            position: 'fixed',
            left: 0,
            top: 64,
          }}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </Sider>

        <Button
          type="text"
          icon={sidebarOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: 'fixed',
            top: 80,
            left: sidebarOpen ? 256 : 0,
            zIndex: 100,
            width: 24,
            height: 48,
            borderRadius: '0 6px 6px 0',
            background: '#fff',
            border: '1px solid #f0f0f0',
            borderLeft: 'none',
            boxShadow: '2px 0 8px rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'left 0.2s',
          }}
        />
        
        <Layout
          style={{
            marginLeft: sidebarOpen ? 256 : 0,
            transition: 'margin-left 0.2s',
            background: '#f5f5f5',
          }}
        >
          <Content style={{ padding: '24px', minHeight: 'calc(100vh - 64px)' }}>
            <Routes>
              <Route path="/" element={<TodoListPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/list/:id" element={<ListPage />} />
              <Route path="/tag/:id" element={<TagPage />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default App;
