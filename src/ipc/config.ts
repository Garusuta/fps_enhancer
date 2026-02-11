// src/ipc/config.ts

import { invoke } from '@tauri-apps/api/core';
import { AppConfig } from '../types';

/**
 * 读取完整配置文件
 * @returns Promise<AppConfig> 完整的应用配置
 */
export async function loadAllConfig(): Promise<AppConfig> {
  const result = await invoke<AppConfig>('load_all_config');
  return result;
}

/**
 * 保存完整配置文件
 * 必须传入完整的 AppConfig 对象
 * @param config 完整的应用配置对象
 */
export async function saveAllConfig(config: AppConfig): Promise<void> {
  await invoke('save_all_config', { appConfig: config });
}

/**
 * 重置配置为默认值
 */
export async function resetConfig(): Promise<void> {
  await invoke('reset_config');
}