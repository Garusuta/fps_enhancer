// src/App.tsx

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ValorantPage from './pages/ValorantPage';
import SettingsPage from './pages/SettingsPage';
import TutorialPage from './pages/TutorialPage';
import AboutPage from './pages/AboutPage';

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/valorant" element={<ValorantPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/tutorial" element={<TutorialPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;