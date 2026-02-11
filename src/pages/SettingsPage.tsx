// src/pages/SettingsPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Switch,
  Button,
  Space,
  Typography,
  message,
  Spin,
  Collapse,
  Modal,
  Alert,
} from 'antd';
import {
  EditOutlined,
  SaveOutlined,
  UndoOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { loadAllConfig, saveAllConfig, resetConfig } from '../ipc/config';
import type { AppConfig } from '../types';

const { Title } = Typography;

const SettingsPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [resetLoading, setResetLoading] = useState<boolean>(false);
  const [originalConfig, setOriginalConfig] = useState<AppConfig | null>(null);

  const loadConfigAndFillForm = useCallback(async () => {
    try {
      const appConfig = await loadAllConfig();
      setOriginalConfig(appConfig);
      
      form.setFieldsValue({
        watcher_game_path: appConfig.Watcher.GamePath ?? '',
        watcher_width: appConfig.Watcher.Width,
        watcher_height: appConfig.Watcher.Height,
        watcher_fps: appConfig.Watcher.Fps,
        valorant_launcher_path: appConfig.Valorant.LauncherPath ?? '',
        valorant_game_path: appConfig.Valorant.GamePath ?? '',
        development_debug: appConfig.Development.Debug,
      });
    } catch (error) {
      message.error(`加载配置失败: ${error}`);
    }
  }, [form]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadConfigAndFillForm();
      setLoading(false);
    };
    init();
  }, [loadConfigAndFillForm]);

  const toggleEditMode = () => {
    if (isEditing) {
      loadConfigAndFillForm();
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      if (!originalConfig) {
        message.error('配置加载失败，请刷新页面');
        return;
      }

      // 构造完整的 AppConfig 对象
      // 关键修复：保留空字符串，不转为 null
      const updatedConfig: AppConfig = {
        Watcher: {
          GamePath: originalConfig.Watcher.GamePath, // 只读字段，保持原值
          Width: values.watcher_width,
          Height: values.watcher_height,
          Fps: values.watcher_fps,
        },
        Valorant: {
          // 保留空字符串，确保字段会被写入文件
          LauncherPath: (values.valorant_launcher_path ?? '').trim(),
          GamePath: (values.valorant_game_path ?? '').trim(),
        },
        Development: {
          Debug: values.development_debug ?? false,
        },
      };

      setSaveLoading(true);
      await saveAllConfig(updatedConfig);
      
      setOriginalConfig(updatedConfig);
      setIsEditing(false);
      message.success('配置保存成功');
    } catch (error) {
      if (error instanceof Error) {
        message.error(`保存配置失败: ${error.message}`);
      } else {
        message.error(`保存配置失败: ${error}`);
      }
    } finally {
      setSaveLoading(false);
    }
  };

  const handleReset = () => {
    Modal.confirm({
      title: '确认重置配置',
      content: '此操作将把所有配置重置为默认值，是否继续？',
      okText: '确认重置',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        setResetLoading(true);
        try {
          await resetConfig();
          await loadConfigAndFillForm();
          setIsEditing(false);
          message.success('配置已重置为默认值');
        } catch (error) {
          message.error(`重置配置失败: ${error}`);
        } finally {
          setResetLoading(false);
        }
      },
    });
  };

  const collapseItems = [
    {
      key: 'watcher',
      label: 'Watcher 配置',
      children: (
        <>
          <Form.Item
            label="游戏路径"
            name="watcher_game_path"
            tooltip="此字段为只读，请在通用页设置"
          >
            <Input disabled placeholder="未设置游戏路径" />
          </Form.Item>
          <Form.Item
            label="宽度"
            name="watcher_width"
            rules={[
              { required: true, message: '请输入宽度' },
              { type: 'number', min: 1, message: '宽度必须为正整数' },
            ]}
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入宽度" />
          </Form.Item>
          <Form.Item
            label="高度"
            name="watcher_height"
            rules={[
              { required: true, message: '请输入高度' },
              { type: 'number', min: 1, message: '高度必须为正整数' },
            ]}
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入高度" />
          </Form.Item>
          <Form.Item
            label="帧率 (FPS)"
            name="watcher_fps"
            rules={[
              { required: true, message: '请输入帧率' },
              { type: 'number', min: 1, message: '帧率必须为正整数' },
            ]}
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入帧率" />
          </Form.Item>
        </>
      ),
    },
    {
      key: 'valorant',
      label: 'Valorant 配置',
      children: (
        <>
          <Form.Item
            label="启动器路径"
            name="valorant_launcher_path"
            tooltip="留空会保存为空字符串"
          >
            <Input placeholder="请输入启动器路径（可留空）" allowClear />
          </Form.Item>
          <Form.Item
            label="游戏路径"
            name="valorant_game_path"
            tooltip="留空会保存为空字符串"
          >
            <Input placeholder="请输入游戏路径（可留空）" allowClear />
          </Form.Item>
        </>
      ),
    },
    {
      key: 'development',
      label: '开发配置',
      children: (
        <Form.Item
          label="调试模式"
          name="development_debug"
          valuePropName="checked"
          tooltip="开启后会显示调试信息"
        >
          <Switch checkedChildren="开启" unCheckedChildren="关闭" />
        </Form.Item>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>设置</Title>
        <Space>
          <Button
            icon={isEditing ? <CloseOutlined /> : <EditOutlined />}
            onClick={toggleEditMode}
            type={isEditing ? 'default' : 'primary'}
          >
            {isEditing ? '取消编辑' : '编辑配置'}
          </Button>
          {isEditing && (
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={saveLoading}
            >
              保存
            </Button>
          )}
          <Button
            danger
            icon={<UndoOutlined />}
            onClick={handleReset}
            loading={resetLoading}
          >
            重置配置
          </Button>
        </Space>
      </div>

      {!isEditing && (
        <Alert
          message="当前为只读模式，点击「编辑配置」按钮后可修改设置"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {isEditing && (
        <Alert
          message="编辑模式已开启，修改后请点击「保存」按钮"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        disabled={!isEditing}
      >
        <Collapse
          defaultActiveKey={['watcher', 'valorant', 'development']}
          items={collapseItems}
        />
      </Form>
    </div>
  );
};

export default SettingsPage;