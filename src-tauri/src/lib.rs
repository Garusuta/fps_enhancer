use crate::state::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(AppState::new())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            // 配置命令
            config::load_all_config,
            config::save_all_config,
            config::reset_config,
            // 监听命令
            watcher::create_general_watcher,
            watcher::toggle_watching,
            watcher::get_watching_status,
            watcher::get_gaming_status,
            // 无畏契约
            valorant::init::scan_game_path,
            valorant::launcher::start_game,
            valorant::resulotion::restore_file_pemission,
            valorant::resulotion::create_preset_watcher,
            utils::hide_task,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

pub mod config;
pub mod constant;
pub mod display;
pub mod state;
pub mod utils;
pub mod valorant;
pub mod watcher;
