// src/pages/HomePage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Switch, Button, Space, Typography, message, Spin, Tag } from 'antd';
import {
  PlayCircleOutlined,
  FolderOpenOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { loadAllConfig, saveAllConfig } from '../ipc/config';
import { toggleWatching, getWatchingStatus, getGamingStatus } from '../ipc/watcher';
import { startGame } from '../ipc/valorant';
import { openFileDialog } from '../ipc/utils';
import type { AppConfig } from '../types';

const { Text, Title } = Typography;

const HomePage: React.FC = () => {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [watchingStatus, setWatchingStatus] = useState<boolean>(false);
  const [gamingStatus, setGamingStatus] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [switchLoading, setSwitchLoading] = useState<boolean>(false);
  const [startLoading, setStartLoading] = useState<boolean>(false);
  const [selectPathLoading, setSelectPathLoading] = useState<boolean>(false);

  const refreshStatus = useCallback(async () => {
    try {
      const [watchStatus, gameStatus, appConfig] = await Promise.all([
        getWatchingStatus(),
        getGamingStatus(),
        loadAllConfig(),
      ]);
      setWatchingStatus(watchStatus);
      setGamingStatus(gameStatus);
      setConfig(appConfig);
    } catch (error) {
      message.error(`刷新状态失败: ${error}`);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await refreshStatus();
      setLoading(false);
    };
    init();
  }, [refreshStatus]);

  const handleToggleWatching = async () => {
    setSwitchLoading(true);
    try {
      const newStatus = await toggleWatching();
      setWatchingStatus(newStatus);
      message.success(newStatus ? '监听器已启动' : '监听器已停止');
      await refreshStatus();
    } catch (error) {
      message.error(`切换监听器失败: ${error}`);
    } finally {
      setSwitchLoading(false);
    }
  };

  const handleStartGame = async () => {
    // 注意：使用 PascalCase 字段名
    if (!config?.Watcher.GamePath) {
      message.warning('请先设置游戏路径');
      return;
    }

    setStartLoading(true);
    try {
      await startGame();
      message.success('游戏启动成功');
      await refreshStatus();
    } catch (error) {
      message.error(`启动游戏失败: ${error}`);
    } finally {
      setStartLoading(false);
    }
  };

  const handleSelectGamePath = async () => {
    setSelectPathLoading(true);
    try {
      const selectedPath = await openFileDialog({
        title: '选择游戏可执行文件',
        directory: false,
        filters: [
          { name: '可执行文件', extensions: ['exe'] },
        ],
      });

      if (!selectedPath) {
        setSelectPathLoading(false);
        return;
      }

      const currentConfig = await loadAllConfig();

      // 使用 PascalCase 字段名
      const updatedConfig: AppConfig = {
        ...currentConfig,
        Watcher: {
          ...currentConfig.Watcher,
          GamePath: selectedPath,
        },
      };

      await saveAllConfig(updatedConfig);
      setConfig(updatedConfig);
      message.success('游戏路径设置成功');
    } catch (error) {
      message.error(`设置游戏路径失败: ${error}`);
    } finally {
      setSelectPathLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <Card
        title={<Title level={4} style={{ margin: 0 }}>通用控制面板</Title>}
        style={{ width: 600 }}
        extra={
          <Button icon={<ReloadOutlined />} onClick={refreshStatus} type="text">
            刷新
          </Button>
        }
      >
        {/* 状态区 */}
        <div style={{ marginBottom: 24 }}>
          <Title level={5}>状态信息</Title>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text>监听器状态：</Text>
              <Space>
                {watchingStatus ? (
                  <Tag icon={<CheckCircleOutlined />} color="success">运行中</Tag>
                ) : (
                  <Tag icon={<CloseCircleOutlined />} color="error">已停止</Tag>
                )}
                <Switch
                  checked={watchingStatus}
                  onChange={handleToggleWatching}
                  loading={switchLoading}
                  checkedChildren="开启"
                  unCheckedChildren="关闭"
                />
              </Space>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text>游戏状态：</Text>
              {gamingStatus ? (
                <Tag icon={<CheckCircleOutlined />} color="success">运行中</Tag>
              ) : (
                <Tag icon={<CloseCircleOutlined />} color="default">未运行</Tag>
              )}
            </div>
          </Space>
        </div>

        {/* 路径区 - 使用 PascalCase */}
        <div style={{ marginBottom: 24 }}>
          <Title level={5}>游戏路径</Title>
          <div style={{ padding: 12, background: '#fafafa', borderRadius: 6, border: '1px solid #d9d9d9' }}>
            {config?.Watcher.GamePath ? (
              <Text code>{config.Watcher.GamePath}</Text>
            ) : (
              <Text type="secondary">未设置游戏路径</Text>
            )}
          </div>
        </div>

        {/* 操作区 */}
        <div>
          <Title level={5}>操作</Title>
          <Space size="middle">
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={handleStartGame}
              loading={startLoading}
              size="large"
            >
              一键启动
            </Button>
            <Button
              icon={<FolderOpenOutlined />}
              onClick={handleSelectGamePath}
              loading={selectPathLoading}
              size="large"
            >
              选择游戏路径
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default HomePage;