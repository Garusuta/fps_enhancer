// src/ipc/utils.ts

import { open } from '@tauri-apps/plugin-dialog';

/**
 * 打开文件选择对话框
 * @param options 对话框选项
 * @returns Promise<string | null> 选择的文件/文件夹路径
 */
export async function openFileDialog(options?: {
  directory?: boolean;
  filters?: { name: string; extensions: string[] }[];
  title?: string;
}): Promise<string | null> {
  const selected = await open({
    directory: options?.directory ?? false,
    multiple: false,
    filters: options?.filters,
    title: options?.title,
  });
  
  if (selected && typeof selected === 'string') {
    return selected;
  }
  return null;
}