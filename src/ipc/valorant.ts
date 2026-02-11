// src/ipc/valorant.ts

import { invoke } from '@tauri-apps/api/core';

/**
 * 扫描无畏契约游戏路径
 * 该命令会自动将扫描到的路径写入配置文件
 * 调用成功后需要重新调用 loadAllConfig 获取更新后的配置
 */
export async function scanGamePath(): Promise<void> {
  await invoke('scan_game_path');
}

/**
 * 启动无畏契约游戏
 */
export async function startGame(): Promise<void> {
  await invoke('start_game');
}

/**
 * 解锁无畏契约文件权限
 */
export async function restoreFilePermission(): Promise<void> {
  await invoke('restore_file_pemission');
}

/**
 * 创建无畏契约预设监听器
 */
export async function createPresetWatcher(): Promise<void> {
  await invoke('create_preset_watcher');
}

/**
 * 隐藏系统任务栏
 */
export async function hideTask(): Promise<void> {
  await invoke('hide_task');
}