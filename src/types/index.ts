// src/types/index.ts

/**
 * Watcher 配置接口
 */
export interface WatcherConfig {
  GamePath: string;   // 游戏路径，空为 ""
  Width: number;
  Height: number;
  Fps: number;
}

/**
 * Valorant 配置接口
 */
export interface ValorantConfig {
  LauncherPath: string;  // 启动器路径，空为 ""
  GamePath: string;      // 游戏路径，空为 ""
}

/**
 * 开发配置接口
 */
export interface DevelopmentConfig {
  Debug: boolean;
}

/**
 * 完整应用配置接口
 */
export interface AppConfig {
  Watcher: WatcherConfig;
  Valorant: ValorantConfig;
  Development: DevelopmentConfig;
}