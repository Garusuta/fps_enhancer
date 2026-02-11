// src/components/Layout.tsx

import React from 'react';
import { Layout as AntLayout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  AimOutlined,
  SettingOutlined,
  BookOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';

const { Sider, Content } = AntLayout;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: '/', icon: <HomeOutlined />, label: '通用' },
    { key: '/valorant', icon: <AimOutlined />, label: '无畏契约' },
    { key: '/settings', icon: <SettingOutlined />, label: '设置' },
    { key: '/tutorial', icon: <BookOutlined />, label: '教程' },
    { key: '/about', icon: <InfoCircleOutlined />, label: '关于' },
  ];

  return (
    <AntLayout style={{ minHeight: '100vh', minWidth: 800 }}>
      <Sider width={200} style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #f0f0f0' }}>
          <h2 style={{ margin: 0, color: '#1890ff' }}>游戏监听器</h2>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Content style={{ padding: 24, background: '#f5f5f5', overflow: 'auto' }}>
        {children}
      </Content>
    </AntLayout>
  );
};

export default Layout;