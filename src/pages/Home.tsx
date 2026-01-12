import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import Switch from '../components/Switch';
import '../styles/home.css';

const Home: React.FC = () => {
  const [isWatching, setIsWatching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    checkStatus();
    checkAdmin();
  }, []);

  const checkStatus = async () => {
    try {
      const watching = await invoke<boolean>('get_watching_status');
      setIsWatching(watching);
    } catch (error) {
      console.error('Failed to check status:', error);
    }
  };

  const checkAdmin = async () => {
    try {
      const elevated = await invoke<boolean>('is_elevated');
      setIsAdmin(elevated);
    } catch (error) {
      console.error('Failed to check admin status:', error);
      setIsAdmin(false);
    }
  };

  const toggleWatching = async (enabled: boolean) => {
    setIsLoading(true);
    try {
      if (enabled) {
        await invoke('start_watching');
      } else {
        await invoke('stop_watching');
      }
      setIsWatching(enabled);
    } catch (error) {
      console.error('Failed to toggle watching:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="home-page">
      <div className="page-header">
        <div className="header-content">
          <h1>控制面板</h1>
          <p className="page-description">管理你的无畏契约 4:3 分辨率设置</p>
        </div>

        {/* 管理员状态 */}
        <div className={`admin-badge ${isAdmin === null ? 'loading' : isAdmin ? 'admin' : 'user'}`}>
          {isAdmin === null ? (
            <>
              <span className="admin-icon">⏳</span>
              <span>检测中...</span>
            </>
          ) : isAdmin ? (
            <>
              <span className="admin-icon">🛡️</span>
              <span>管理员</span>
            </>
          ) : (
            <>
              <span className="admin-icon">👤</span>
              <span>普通用户</span>
            </>
          )}
        </div>
      </div>

      {/* 非管理员警告 */}
      {isAdmin === false && (
        <div className="warning-banner">
          <span className="warning-icon">⚠️</span>
          <div className="warning-content">
            <strong>建议以管理员身份运行</strong>
            <p>部分功能可能需要管理员权限才能正常工作</p>
          </div>
        </div>
      )}

      <div className="cards-container">
        {/* 主监听卡片 */}
        <div className="card main-card">
          <div className="card-header">
            <div className="card-title-group">
              <h2>进程监听</h2>
              <span className={`status-badge ${isWatching ? 'active' : 'inactive'}`}>
                {isWatching ? '运行中' : '已停止'}
              </span>
            </div>
            <Switch
              checked={isWatching}
              onChange={toggleWatching}
              disabled={isLoading}
            />
          </div>
          <p className="card-description">
            开启后将自动检测无畏契约进程，并在游戏启动时自动切换到预设的 4:3 分辨率
          </p>
        </div>

        {/* 当前配置卡片 */}
        <div className="card info-card">
          <h2>当前配置</h2>
          <div className="config-preview">
            <div className="config-item">
              <span className="config-label">桌面分辨率</span>
              <span className="config-value">1920 × 1080 @ 144Hz</span>
            </div>
            <div className="config-item">
              <span className="config-label">游戏分辨率</span>
              <span className="config-value">1568 × 1080 @ 144Hz</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;