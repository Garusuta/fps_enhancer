use crate::{config, utils::run_command};

#[tauri::command]
pub async fn start_game() -> Result<(), String> {
    let valorant_config = config::load_valrant_config().map_err(|e| e.to_string())?;
    let launcher_path = valorant_config.launcher_path.unwrap();
    run_command(&["start", "", launcher_path.as_str()]).map_err(|e| e.to_string())?;
    Ok(())
}
