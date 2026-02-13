// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use fps_enhancer_lib::{configs::app_config::EmbedConfigs, utils::{constant_manager::{CONFIG_FILE, WORK_DIR}, logger_manager::init_logger}};
use tracing::{debug, info};


fn main() {
    let _guard = init_logger();
    info!("Starting FPS Enhancer...");
    debug!("WORK_DIR: {:?}", WORK_DIR);
    debug!("CONFIG_FILE: {:?}", CONFIG_FILE);
    let result = EmbedConfigs::init();
    debug!("Initialize embeded configs: {:?}", result);
    fps_enhancer_lib::run()
}
