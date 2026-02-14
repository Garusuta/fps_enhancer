// src/pages/ValorantPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Space, Typography, message, Spin } from 'antd';
import {
  SearchOutlined,
  SettingOutlined,
  UnlockOutlined,
  EyeInvisibleOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { loadAllConfig } from '../ipc/config';
import {
  scanGamePath,
  createPresetWatcher,
  restoreFilePermission,
  hideWindowsTask,
  modifyCfgFile,
} from '../ipc/valorant';
import type { AppConfig } from '../types';

const { Text, Title, Paragraph } = Typography;

const ValorantPage: React.FC = () => {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [scanLoading, setScanLoading] = useState<boolean>(false);
  const [presetLoading, setPresetLoading] = useState<boolean>(false);
  const [permissionLoading, setPermissionLoading] = useState<boolean>(false);
  const [hideTaskLoading, setHideTaskLoading] = useState<boolean>(false);
  const [cfgLoading, setCfgLoading] = useState<boolean>(false); // 新增 CFG loading 状态

  const loadConfig = useCallback(async () => {
    try {
      const appConfig = await loadAllConfig();
      setConfig(appConfig);
    } catch (error) {
      message.error(`加载配置失败: ${error}`);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadConfig();
      setLoading(false);
    };
    init();
  }, [loadConfig]);

  /**
   * 获取游戏路径
   */
  const handleScanGamePath = async () => {
    setScanLoading(true);
    try {
      await scanGamePath();
      const updatedConfig = await loadAllConfig();
      setConfig(updatedConfig);
      message.success('游戏路径扫描并保存成功');
    } catch (error) {
      message.error(`扫描游戏路径失败: ${error}`);
    } finally {
      setScanLoading(false);
    }
  };

  /**
   * 应用预设到监听器
   */
  const handleCreatePresetWatcher = async () => {
    if (!config?.Valorant.GamePath) {
      message.warning('请先获取游戏路径');
      return;
    }

    setPresetLoading(true);
    try {
      await createPresetWatcher();
      message.success('预设已应用到监听器');
    } catch (error) {
      message.error(`应用预设失败: ${error}`);
    } finally {
      setPresetLoading(false);
    }
  };

  /**
   * 解锁文件权限
   */
  const handleRestorePermission = async () => {
    setPermissionLoading(true);
    try {
      await restoreFilePermission();
      message.success('只读权限已解锁');
    } catch (error) {
      message.error(`解锁文件权限失败: ${error}`);
    } finally {
      setPermissionLoading(false);
    }
  };

  /**
   * 隐藏任务栏
   */
  const handleHideTask = async () => {
    setHideTaskLoading(true);
    try {
      await hideWindowsTask();
      message.success('TODO：该功能还没做呢');
    } catch (error) {
      message.error(`隐藏任务栏失败: ${error}`);
    } finally {
      setHideTaskLoading(false);
    }
  };

  /**
   * 一键修改 CFG 文件
   */
  const handleModifyCfg = async () => {
    // 前置校验：检查游戏路径
    if (!config?.Valorant.GamePath) {
      message.warning('请先获取游戏路径');
      return;
    }

    setCfgLoading(true);
    try {
      await modifyCfgFile();
      message.success('CFG 文件修改成功');
    } catch (error) {
      message.error(`CFG 文件修改失败: ${error}`);
    } finally {
      setCfgLoading(false);
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
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Title level={3} style={{ marginBottom: 24 }}>无畏契约</Title>

      {/* 当前游戏路径展示 */}
      <Card style={{ marginBottom: 16 }}>
        <Title level={5}>当前游戏路径</Title>
        <div style={{ padding: 12, background: '#fafafa', borderRadius: 6, border: '1px solid #d9d9d9', marginBottom: 8 }}>
          <Text strong>Valorant 路径：</Text>
          {config?.Valorant.GamePath ? (
            <Text code style={{ marginLeft: 8 }}>{config.Valorant.GamePath}</Text>
          ) : (
            <Text type="secondary" style={{ marginLeft: 8 }}>未设置</Text>
          )}
        </div>
        <div style={{ padding: 12, background: '#fafafa', borderRadius: 6, border: '1px solid #d9d9d9' }}>
          <Text strong>启动器路径：</Text>
          {config?.Valorant.LauncherPath ? (
            <Text code style={{ marginLeft: 8 }}>{config.Valorant.LauncherPath}</Text>
          ) : (
            <Text type="secondary" style={{ marginLeft: 8 }}>未设置</Text>
          )}
        </div>
      </Card>

      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* 获取游戏路径 */}
        <Card>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Title level={5} style={{ margin: 0 }}>获取游戏路径</Title>
            <Paragraph type="secondary" style={{ margin: 0 }}>
              自动扫描系统中已安装的无畏契约游戏路径（需启动游戏），扫描成功后将自动保存到配置文件。
            </Paragraph>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleScanGamePath}
              loading={scanLoading}
            >
              扫描游戏路径
            </Button>
          </Space>
        </Card>

        {/* 应用预设到监听器 */}
        <Card>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Title level={5} style={{ margin: 0 }}>应用预设到监听器</Title>
            <Paragraph type="secondary" style={{ margin: 0 }}>
              将无畏契约的预设配置应用到通用监听器。需要先获取游戏路径。
            </Paragraph>
            <Button
              icon={<SettingOutlined />}
              onClick={handleCreatePresetWatcher}
              loading={presetLoading}
            >
              应用预设
            </Button>
          </Space>
        </Card>

        <Card>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Title level={5} style={{ margin: 0 }}>一键修改 CFG</Title>
            <Paragraph type="secondary" style={{ margin: 0 }}>
              一键修改无畏契约的 CFG 配置文件，强制锁定预设分辨率。需要先获取游戏路径。
            </Paragraph>
            <Button
              danger
              icon={<FileTextOutlined />}
              onClick={handleModifyCfg}
              loading={cfgLoading}
            >
              修改 CFG 文件
            </Button>
          </Space>
        </Card>

        <Card>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Title level={5} style={{ margin: 0 }}>解锁 CFG 文件权限</Title>
            <Paragraph type="secondary" style={{ margin: 0 }}>
              解锁无畏契约CFG文件只读的访问权限（仅当前登录账号）。
            </Paragraph>
            <Button
              icon={<UnlockOutlined />}
              onClick={handleRestorePermission}
              loading={permissionLoading}
            >
              解锁权限
            </Button>
          </Space>
        </Card>

        <Card>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Title level={5} style={{ margin: 0 }}>显示任务栏</Title>
            <Paragraph type="secondary" style={{ margin: 0 }}>
              显示系统任务栏，防止游戏窗口被遮挡。
            </Paragraph>
            <Button
              icon={<EyeInvisibleOutlined />}
              onClick={handleHideTask}
              loading={hideTaskLoading}
            >
              隐藏任务栏
            </Button>
          </Space>
        </Card>
      </Space>
    </div>
  );
};

export default ValorantPage;