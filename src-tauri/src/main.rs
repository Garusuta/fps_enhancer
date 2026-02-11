// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use fps_enhancer_lib::{
    config::initialize_configs,
    constant::{CONFIG_FILE, WORK_DIR},
    utils::init_logger,
};
use tracing::{debug, info};

fn main() {
    let _guard = init_logger();
    info!("Starting FPS Enhancer...");
    debug!("WORK_DIR: {:?}", WORK_DIR);
    debug!("CONFIG_FILE: {:?}", CONFIG_FILE);
    let result = initialize_configs();
    debug!("initialize_configs: {:?}", result);
    fps_enhancer_lib::run()
}
