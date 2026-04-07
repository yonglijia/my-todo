import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TodoListPage from './pages/TodoList';
import CalendarPage from './pages/Calendar';
import ListPage from './pages/ListPage';
import TagPage from './pages/TagPage';
import TodayPage from './pages/TodayPage';
import TomorrowPage from './pages/TomorrowPage';
import CompletedPage from './pages/CompletedPage';

const { Sider, Content } = Layout;

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <Layout style={{ marginTop: 64 }}>
        <Sider
          width={280}
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
          <Sidebar onClose={() => setSidebarOpen(false)} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
        </Sider>

        
        <Layout
          style={{
            marginLeft: sidebarOpen ? 280 : 0,
            transition: 'margin-left 0.2s',
            background: '#f5f5f5',
          }}
        >
          <Content style={{ padding: '24px', minHeight: 'calc(100vh - 64px)' }}>
            <Routes>
              <Route path="/" element={<TodoListPage />} />
              <Route path="/today" element={<TodayPage />} />
              <Route path="/tomorrow" element={<TomorrowPage />} />
              <Route path="/completed" element={<CompletedPage />} />
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
