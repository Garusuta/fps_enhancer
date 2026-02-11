// src/pages/AboutPage.tsx

import React from 'react';
import { Card, Avatar, Button, Space, Typography, message, Row, Col } from 'antd';
import { GithubOutlined, SyncOutlined } from '@ant-design/icons';
import { open } from '@tauri-apps/plugin-shell';

// 本地资源导入
import avatarImage from '../assets/avatar.png';
import logoImage from '../assets/logo.png';

const { Title, Text, Paragraph, Link } = Typography;

// 配置信息
const CONFIG = {
  // 作者信息
  author: {
    name: 'Garusuta',
    signature: '我从山中来，带着兰花草',
    discord: 'nachoneko0906',
    githubUrl: 'https://github.com/Garusuta',
  },
  // 项目信息
  project: {
    name: 'FPSEnhancer',
    version: '1.1.0',
    description: '自动监听进程，启动时切换到预设分辨率，退出后自动恢复',
    repoUrl: 'https://github.com/Garusuta/fps_enhancer',
    releaseUrl: 'https://github.com/Garusuta/fps_enhancer/releases',
  },
};

const AboutPage: React.FC = () => {
  /**
   * 打开外部链接
   */
  const handleOpenLink = async (url: string) => {
    try {
      await open(url);
    } catch (error) {
      message.error(`打开链接失败: ${error}`);
    }
  };

  /**
   * 检查更新 - 跳转到 Release 页面
   */
  const handleCheckUpdate = async () => {
    try {
      await open(CONFIG.project.releaseUrl);
    } catch (error) {
      message.error(`打开链接失败: ${error}`);
    }
  };

  // 统一卡片样式
  const cardStyle: React.CSSProperties = {
    width: 350,
    height: 360,
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
  };

  const cardBodyStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 24,
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <Row gutter={24}>
        {/* 作者信息卡片 */}
        <Col>
          <Card style={cardStyle} styles={{ body: cardBodyStyle }} hoverable>
            <div>
              <Avatar
                size={100}
                src={avatarImage}
                alt="Author Avatar"
                style={{ marginBottom: 16 }}
              />
              <Title level={4} style={{ margin: '0 0 4px 0' }}>{CONFIG.author.name}</Title>
              <Paragraph 
                type="secondary" 
                style={{ 
                  margin: '0 0 16px 0',
                  fontStyle: 'italic',
                  fontSize: 13,
                }}
              >
                "{CONFIG.author.signature}"
              </Paragraph>
            </div>

            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Button
                type="primary"
                icon={<GithubOutlined />}
                onClick={() => handleOpenLink(CONFIG.author.githubUrl)}
                block
              >
                访问 Github 主页
              </Button>
              <div>
                <Text strong>Discord: </Text>
                <Text copyable={{ tooltips: ['复制', '已复制'] }}>
                  {CONFIG.author.discord}
                </Text>
              </div>
            </Space>
          </Card>
        </Col>

        {/* 软件信息卡片 */}
        <Col>
          <Card style={cardStyle} styles={{ body: cardBodyStyle }} hoverable>
            <div>
              <div
                style={{
                  width: 100,
                  height: 100,
                  margin: '0 auto 16px',
                  borderRadius: 20,
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                }}
              >
                <img 
                  src={logoImage} 
                  alt="App Logo"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
              <Title level={4} style={{ margin: '0 0 4px 0' }}>{CONFIG.project.name}</Title>
              <Paragraph type="secondary" style={{ margin: '0 0 8px 0', fontSize: 12 }}>
                版本 {CONFIG.project.version}
              </Paragraph>
              {/* 软件描述 */}
              <Paragraph 
                style={{ 
                  margin: 0,
                  fontSize: 13,
                  color: '#666',
                }}
              >
                {CONFIG.project.description}
              </Paragraph>
            </div>

            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Text strong>仓库地址：</Text>
                <br />
                <Link onClick={() => handleOpenLink(CONFIG.project.repoUrl)}>
                  {CONFIG.project.repoUrl.replace('https://', '')}
                </Link>
              </div>
              <Button
                icon={<SyncOutlined />}
                onClick={handleCheckUpdate}
                block
              >
                检查更新
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AboutPage;