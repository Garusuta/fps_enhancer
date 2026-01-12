import React from 'react';
import { useConfig } from '../hooks/useConfig';
import NumberInput from '../components/NumberInput';
import Button from '../components/Button';
import '../styles/settings.css';

const Settings: React.FC = () => {
  const {
    config,
    loading,
    saving,
    hasChanges,
    updateDesktop,
    updateGame,
    setGamePreset,
    applyConfig,
    resetConfig,
  } = useConfig();

  const handleApply = async () => {
    const success = await applyConfig();
    if (success) {
      console.log('配置已保存');
    }
  };

  if (loading) {
    return (
      <div className="settings-page">
        <div className="loading">加载配置中...</div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <div className="header-content">
          <h1>设置</h1>
          <p className="page-description">配置桌面和游戏分辨率参数</p>
        </div>
        <div className="header-actions">
          {hasChanges() && (
            <Button variant="ghost" onClick={resetConfig}>
              重置
            </Button>
          )}
          <Button
            variant="primary"
            onClick={handleApply}
            disabled={!hasChanges() || saving}
          >
            {saving ? '保存中...' : '应用'}
          </Button>
        </div>
      </div>

      <div className="settings-container">
        {/* 桌面分辨率设置 */}
        <div className="settings-section">
          <div className="section-header">
            <div className="section-icon">🖥️</div>
            <div className="section-title">
              <h2>桌面分辨率</h2>
              <p>游戏退出后恢复的分辨率设置</p>
            </div>
          </div>

          <div className="settings-grid">
            <NumberInput
              label="宽度 (X)"
              value={config.Desktop.ResolutionSizeX}
              onChange={(value) => updateDesktop('ResolutionSizeX', value)}
            />
            <NumberInput
              label="高度 (Y)"
              value={config.Desktop.ResolutionSizeY}
              onChange={(value) => updateDesktop('ResolutionSizeY', value)}
            />
            <NumberInput
              label="刷新率 (Hz)"
              value={config.Desktop.RefreshRate}
              onChange={(value) => updateDesktop('RefreshRate', value)}
            />
          </div>

          <div className="resolution-preview">
            <span className="preview-label">预览:</span>
            <span className="preview-value">
              {config.Desktop.ResolutionSizeX} × {config.Desktop.ResolutionSizeY} @{' '}
              {config.Desktop.RefreshRate}Hz
            </span>
          </div>
        </div>

        {/* 游戏分辨率设置 */}
        <div className="settings-section">
          <div className="section-header">
            <div className="section-icon">🎮</div>
            <div className="section-title">
              <h2>游戏分辨率</h2>
              <p>检测到无畏契约启动后切换的分辨率</p>
            </div>
          </div>

          <div className="settings-grid">
            <NumberInput
              label="宽度 (X)"
              value={config.Game.ResolutionSizeX}
              onChange={(value) => updateGame('ResolutionSizeX', value)}
            />
            <NumberInput
              label="高度 (Y)"
              value={config.Game.ResolutionSizeY}
              onChange={(value) => updateGame('ResolutionSizeY', value)}
            />
            <NumberInput
              label="刷新率 (Hz)"
              value={config.Game.RefreshRate}
              onChange={(value) => updateGame('RefreshRate', value)}
            />
          </div>

          <div className="resolution-preview game">
            <span className="preview-label">预览:</span>
            <span className="preview-value">
              {config.Game.ResolutionSizeX} × {config.Game.ResolutionSizeY} @{' '}
              {config.Game.RefreshRate}Hz
            </span>
            <span className="aspect-ratio">
              比例:{' '}
              {config.Game.ResolutionSizeY > 0
                ? (config.Game.ResolutionSizeX / config.Game.ResolutionSizeY).toFixed(2)
                : '0.00'}
              :1
            </span>
          </div>
        </div>

        {/* 常用预设 */}
        <div className="settings-section presets-section">
          <div className="section-header">
            <div className="section-icon">⚡</div>
            <div className="section-title">
              <h2>快捷预设</h2>
              <p>一键填入常用的分辨率配置（需点击应用保存）</p>
            </div>
          </div>

          <div className="presets-grid">
            <button className="preset-btn" onClick={() => setGamePreset(1440, 1080)}>
              <span className="preset-res">1440 × 1080</span>
              <span className="preset-ratio">4:3</span>
            </button>
            <button className="preset-btn" onClick={() => setGamePreset(1568, 1080)}>
              <span className="preset-res">1568 × 1080</span>
              <span className="preset-ratio">4:3</span>
            </button>
            <button className="preset-btn" onClick={() => setGamePreset(1280, 1024)}>
              <span className="preset-res">1280 × 1024</span>
              <span className="preset-ratio">5:4</span>
            </button>
            <button className="preset-btn" onClick={() => setGamePreset(1280, 960)}>
              <span className="preset-res">1280 × 960</span>
              <span className="preset-ratio">4:3</span>
            </button>
          </div>
        </div>
      </div>

      {/* 未保存提示 */}
      {hasChanges() && (
        <div className="unsaved-indicator">
          <span className="unsaved-dot"></span>
          有未保存的更改
        </div>
      )}
    </div>
  );
};

export default Settings;