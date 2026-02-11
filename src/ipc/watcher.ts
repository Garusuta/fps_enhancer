// src/ipc/watcher.ts

import { invoke } from '@tauri-apps/api/core';

/**
 * 创建通用监听器
 */
export async function createGeneralWatcher(): Promise<void> {
  await invoke('create_general_watcher');
}

/**
 * 切换监听器开关（启动/停止）
 * @returns Promise<boolean> 切换后的状态
 */
export async function toggleWatching(): Promise<boolean> {
  const result = await invoke<boolean>('toggle_watching');
  return result;
}

/**
 * 获取监听器当前运行状态
 * @returns Promise<boolean> 是否正在运行
 */
export async function getWatchingStatus(): Promise<boolean> {
  const result = await invoke<boolean>('get_watching_status');
  return result;
}

/**
 * 获取游戏当前运行状态
 * @returns Promise<boolean> 游戏是否正在运行
 */
export async function getGamingStatus(): Promise<boolean> {
  const result = await invoke<boolean>('get_gaming_status');
  return result;
}