use std::fs;

use tauri::State;

use crate::{
    configs::{
        app_config::{AppConfig, EmbedConfigs},
        app_state::AppState,
    },
    utils::{constant_manager::CONFIG_FILE, display_manager::DisplayMode},
};

#[tauri::command]
pub fn load_config() -> Result<AppConfig, String> {
    let app_config = AppConfig::load_app_config().map_err(|e| e.to_string())?;
    Ok(app_config)
}

#[tauri::command]
pub async fn save_config(state: State<'_, AppState>, app_config: AppConfig) -> Result<(), String> {
    app_config.save_to_local().map_err(|e| e.to_string())?;

    let mut watcher_guard = state.watcher.lock().await;
    if let Some(watcher_instance) = watcher_guard.as_mut() {
        let monitor_name = watcher_instance.display_mode.monitor_name.clone();
        watcher_instance.display_mode = DisplayMode {
            height: app_config.watcher.height,
            width: app_config.watcher.width,
            refresh_rate: app_config.watcher.fps,
            monitor_name: monitor_name,
            ..Default::default()
        };
        if watcher_instance.task.lock().await.is_some() {
            watcher_instance.stop().await;
            watcher_instance.start().await;
        }
    }
    Ok(())
}

#[tauri::command]
pub fn reset_config() -> Result<(), String> {
    let content = EmbedConfigs::get("config.toml").unwrap();
    fs::write(CONFIG_FILE.as_path(), content.data.as_ref()).map_err(|e| e.to_string())?;
    Ok(())
}
