use tauri::State;

use crate::{
    configs::{app_config::AppConfig, app_state::AppState},
    utils::{
        display_manager::{restore_default_settings, DisplayMode},
        watcher_manager::ProcessWatcher,
    },
};

#[tauri::command]
pub async fn toggle_watching(state: State<'_, AppState>) -> Result<bool, String> {
    let mut watcher_guard = state.watcher.lock().await;

    if let Some(watcher_instance) = watcher_guard.as_mut() {
        if watcher_instance.task.lock().await.is_some() {
            watcher_instance.stop().await;
            restore_default_settings().map_err(|e| e.to_string())?;
            Ok(false)
        } else {
            watcher_instance.start().await;
            Ok(true)
        }
    } else {
        let watcher_config = AppConfig::load_watcher_config().map_err(|e| e.to_string())?;
        *watcher_guard = Some(ProcessWatcher::new(
            watcher_config.game_path.unwrap(),
            DisplayMode {
                width: watcher_config.width,
                height: watcher_config.height,
                refresh_rate: watcher_config.fps,
                ..Default::default()
            },
        ));
        if let Some(watcher_instance) = watcher_guard.as_mut() {
            watcher_instance.start().await;
            Ok(true)
        } else {
            Err("Failed to create watcher instance".to_string())
        }
    }
}

#[tauri::command]
pub async fn get_gaming_status(state: State<'_, AppState>) -> Result<bool, String> {
    let mut watcher_guard = state.watcher.lock().await;

    if let Some(watcher_instance) = watcher_guard.as_mut() {
        Ok(watcher_instance.is_running())
    } else {
        Ok(false)
    }
}

#[tauri::command]
pub async fn get_watching_status(state: State<'_, AppState>) -> Result<bool, String> {
    let mut watcher_guard = state.watcher.lock().await;

    if let Some(watcher_instance) = watcher_guard.as_mut() {
        let task_guard = watcher_instance.task.lock().await;
        if task_guard.is_some() {
            Ok(true)
        } else {
            Ok(false)
        }
    } else {
        Ok(false)
    }
}
