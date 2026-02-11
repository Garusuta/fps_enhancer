use crate::constant::CONFIG_FILE;
use rust_embed::RustEmbed;
use serde::{Deserialize, Serialize};
use std::{error::Error, fs};
use toml;
use tracing::debug;

#[derive(RustEmbed)]
#[folder = "configs/"]
struct Configs;

#[derive(Deserialize, Serialize, Debug)]
pub struct AppConfig {
    #[serde(rename = "Watcher")]
    pub watcher: WatcherConfig,
    #[serde(rename = "Valorant")]
    pub valorant: ValorantConfig,
    #[serde(rename = "Development")]
    pub development: DevelopmentConfig,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct WatcherConfig {
    #[serde(rename = "GamePath")]
    pub game_path: Option<String>,
    #[serde(rename = "Width")]
    pub width: u32,
    #[serde(rename = "Height")]
    pub height: u32,
    #[serde(rename = "Fps")]
    pub fps: u32,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct ValorantConfig {
    #[serde(rename = "LauncherPath")]
    pub launcher_path: Option<String>,
    #[serde(rename = "GamePath")]
    pub game_path: Option<String>,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct DevelopmentConfig {
    #[serde(rename = "Debug")]
    debug: bool,
}

pub fn initialize_configs() -> Result<(), Box<dyn Error>> {
    if !CONFIG_FILE.exists() {
        let content = Configs::get("config.toml").unwrap();
        fs::write(CONFIG_FILE.as_path(), content.data.as_ref())?;
    }
    Ok(())
}

#[tauri::command]
pub fn load_all_config() -> Result<AppConfig, String> {
    let config_content = fs::read_to_string(CONFIG_FILE.as_path()).map_err(|e| e.to_string())?;
    debug!("config_content: {:?}", config_content);
    let app_config =
        toml::from_str::<AppConfig>(config_content.as_str()).map_err(|e| e.to_string())?;
    debug!("app_config: {:?}", app_config);
    Ok(app_config)
}

pub fn load_valrant_config() -> Result<ValorantConfig, Box<dyn Error>> {
    let config_content = fs::read_to_string(CONFIG_FILE.as_path())?;
    let app_config = toml::from_str::<AppConfig>(config_content.as_str())?;
    let valorant_config = app_config.valorant;
    Ok(valorant_config)
}

pub fn load_watcher_config() -> Result<WatcherConfig, Box<dyn Error>> {
    let config_content = fs::read_to_string(CONFIG_FILE.as_path())?;
    let app_config = toml::from_str::<AppConfig>(config_content.as_str())?;
    let watcher_config = app_config.watcher;
    Ok(watcher_config)
}

#[tauri::command]
pub fn save_all_config(app_config: AppConfig) -> Result<(), String> {
    let updated = toml::to_string_pretty(&app_config).map_err(|e| e.to_string())?;
    fs::write(CONFIG_FILE.as_path(), updated).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn reset_config() -> Result<(), String> {
    let content = Configs::get("config.toml").unwrap();
    fs::write(CONFIG_FILE.as_path(), content.data.as_ref()).map_err(|e| e.to_string())?;
    Ok(())
}
