use std::{
    collections::HashMap,
    error::Error,
    fs::{read_dir, read_to_string},
    path::{Path, PathBuf},
};

use tauri::State;
use tracing::{debug, info};

use crate::{
    config::{load_all_config, load_valrant_config, load_watcher_config, save_all_config},
    display::DisplayMode,
    state::AppState,
    utils::{insert_line_at, replace_multiple_parallel, run_command},
    watcher::ProcessWatcher,
};
use std::fs::write;

fn get_last_login_user() -> Result<String, Box<dyn Error>> {
    let config = load_valrant_config()?;
    let user_info = read_to_string(
        Path::new(&config.game_path.unwrap())
            .join("ShooterGame\\Saved\\Config\\WindowsClient\\RiotLocalMachine.ini"),
    )?;
    debug!("user_info: \n{}", user_info);
    let last_login_user = user_info
        .lines()
        .find(|line| line.starts_with("LastKnownUser="))
        .ok_or("LastKnownUser not found")?
        .replace("LastKnownUser=", "");
    info!("Last login user: {}", last_login_user);
    Ok(last_login_user)
}

fn get_last_login_user_folder() -> Result<String, Box<dyn Error>> {
    let user_name = get_last_login_user()?;
    let game_path = load_valrant_config()?.game_path;
    let user_name_folder =
        read_dir(Path::new(&game_path.unwrap()).join("ShooterGame\\Saved\\Config"))?
            .filter_map(|entry| entry.ok())
            .find(|entry| {
                entry
                    .file_name()
                    .to_str()
                    .map(|name| name.contains(&user_name))
                    .unwrap_or(false)
            })
            .ok_or("User folder not found")?
            .file_name()
            .into_string()
            .map_err(|_| "Failed to convert OsString to String")?;
    info!("Last login user folder: {}", user_name_folder);
    Ok(user_name_folder)
}

fn modify_game_resolution_config(settings_path: PathBuf) -> Result<(), Box<dyn Error>> {
    let config = load_watcher_config()?;
    let mut settings_content = read_to_string(&settings_path)?;
    debug!("Original settings content: \n{}", settings_content);
    let mut replacements: HashMap<usize, String> = HashMap::new();
    for (line_number, line_content) in settings_content
        .lines()
        .collect::<Vec<&str>>()
        .iter()
        .enumerate()
    {
        if line_content.starts_with("bShouldLetterbox=") {
            debug!("Found bShouldLetterbox at line {}", line_number + 1);
            replacements.insert(line_number + 1, "bShouldLetterbox=False".to_string());
        } else if line_content.starts_with("bLastConfirmedShouldLetterbox=") {
            debug!(
                "Found bLastConfirmedShouldLetterbox at line {}",
                line_number + 1
            );
            replacements.insert(
                line_number + 1,
                "bLastConfirmedShouldLetterbox=False".to_string(),
            );
        } else if line_content.starts_with("bUseVSync=") {
            debug!("Found bUseVSync at line {}", line_number + 1);
            replacements.insert(line_number + 1, "bUseVSync=False".to_string());
        } else if line_content.starts_with("bUseDynamicResolution=") {
            debug!("Found bUseDynamicResolution at line {}", line_number + 1);
            replacements.insert(line_number + 1, "bUseDynamicResolution=False".to_string());
        } else if line_content.starts_with("ResolutionSizeX=") {
            debug!("Found ResolutionSizeX at line {}", line_number + 1);
            replacements.insert(line_number + 1, format!("ResolutionSizeX={}", config.width));
        } else if line_content.starts_with("LastUserConfirmedResolutionSizeX=") {
            debug!(
                "Found LastUserConfirmedResolutionSizeX at line {}",
                line_number + 1
            );
            replacements.insert(
                line_number + 1,
                format!("LastUserConfirmedResolutionSizeX={}", config.width),
            );
        } else if line_content.starts_with("ResolutionSizeY=") {
            debug!("Found ResolutionSizeY at line {}", line_number + 1);
            replacements.insert(
                line_number + 1,
                format!("ResolutionSizeY={}", config.height),
            );
        } else if line_content.starts_with("LastUserConfirmedResolutionSizeY=") {
            debug!(
                "Found LastUserConfirmedResolutionSizeY at line {}",
                line_number + 1
            );
            replacements.insert(
                line_number + 1,
                format!("LastUserConfirmedResolutionSizeY={}", config.height),
            );
        } else if line_content.starts_with("LastConfirmedFullscreenMode=") {
            debug!(
                "Found LastConfirmedFullscreenMode at line {}",
                line_number + 1
            );
            replacements.insert(line_number + 1, "LastConfirmedFullscreenMode=2".to_string());
        } else if line_content.starts_with("PreferredFullscreenMode=") {
            debug!("Found PreferredFullscreenMode at line {}", line_number + 1);
            replacements.insert(line_number + 1, "PreferredFullscreenMode=2".to_string());
        } else if line_content.starts_with("FullscreenMode=") {
            debug!("Found FullscreenMode at line {}", line_number + 1);
            replacements.insert(line_number + 1, "FullscreenMode=2".to_string());
        }
    }
    settings_content = replace_multiple_parallel(settings_content, &replacements)?;
    debug!("Replacements collected: {:?}", replacements);
    if settings_content
        .lines()
        .all(|line| !line.starts_with("FullscreenMode="))
    {
        debug!("FullscreenMode not found, inserting it at the start");
        settings_content = insert_line_at(settings_content, 1, 1, "FullscreenMode=2".to_string())?;
    }
    let target_file = settings_path.to_str().unwrap();
    debug!("Unlocking file: {}", target_file);
    run_command(&["attrib", "-R", target_file])?;
    debug!(
        "Writing modified settings content to file: {:?}",
        settings_path
    );
    write(settings_path.clone(), settings_content)?;
    debug!("Locking file: {}", target_file);
    run_command(&["attrib", "+R", target_file])?;
    Ok(())
}

pub fn modify_game_resolution_config_for_last_user() -> Result<(), Box<dyn Error>> {
    let config = load_valrant_config()?;
    let user_name = get_last_login_user_folder()?;
    let user_settings_path = Path::new(&config.game_path.clone().unwrap()).join(format!(
        "ShooterGame\\Saved\\Config\\{}\\WindowsClient\\GameUserSettings.ini",
        user_name
    ));
    let public_settings_path = Path::new(&config.game_path.clone().unwrap())
        .join("ShooterGame\\Saved\\Config\\WindowsClient\\GameUserSettings.ini");
    info!("Modifying settings file: {:?}", user_settings_path);
    modify_game_resolution_config(user_settings_path)?;
    info!("Modifying settings file: {:?}", public_settings_path);
    modify_game_resolution_config(public_settings_path)?;
    Ok(())
}

#[tauri::command]
pub fn restore_file_pemission() -> Result<(), String> {
    let config = load_valrant_config().map_err(|e| e.to_string())?;
    let user_name = get_last_login_user_folder().map_err(|e| e.to_string())?;
    let user_settings_path = Path::new(&config.game_path.clone().unwrap()).join(format!(
        "ShooterGame\\Saved\\Config\\{}\\WindowsClient\\GameUserSettings.ini",
        user_name
    ));
    let public_settings_path = Path::new(&config.game_path.clone().unwrap())
        .join("ShooterGame\\Saved\\Config\\WindowsClient\\GameUserSettings.ini");
    run_command(&["attrib", "-R", user_settings_path.to_str().unwrap()])
        .map_err(|e| e.to_string())?;
    run_command(&["attrib", "-R", public_settings_path.to_str().unwrap()])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn create_preset_watcher(state: State<'_, AppState>) -> Result<(), String> {
    let mut app_config = load_all_config().map_err(|e| e.to_string())?;
    let watcher_config = &mut app_config.watcher;
    let valorant_config = &app_config.valorant;

    let mut watcher_guard = state.watcher.lock().await;
    *watcher_guard = Some(ProcessWatcher::new(
        valorant_config.launcher_path.clone().unwrap(),
        DisplayMode {
            width: watcher_config.width,
            height: watcher_config.height,
            refresh_rate: watcher_config.fps,
        },
    ));
    watcher_config.game_path = valorant_config.launcher_path.clone();
    save_all_config(app_config).map_err(|e| e.to_string())?;
    Ok(())
}
