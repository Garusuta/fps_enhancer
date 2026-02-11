use crate::{
    config::{load_all_config, save_all_config},
    utils::get_running_process_path,
};

#[tauri::command]
pub async fn scan_game_path() -> Result<(), String> {
    let mut app_config = load_all_config()?;
    app_config.valorant.launcher_path =
        get_running_process_path("无畏契约登录器.exe").map(|p| p.to_string_lossy().into_owned());
    app_config.valorant.game_path =
        get_running_process_path("VALORANT.exe").map(|p| p.to_string_lossy().into_owned());
    save_all_config(app_config)?;
    Ok(())
}
