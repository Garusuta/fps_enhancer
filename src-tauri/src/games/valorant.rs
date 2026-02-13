use std::{
    collections::HashMap, error::Error, fs::{read_dir, read_to_string}, path::{Path, PathBuf}
};

use tracing::debug;

use crate::{
    configs::app_config::AppConfig, utils::{command_manager::run_command, text_manager::{insert_line_at, replace_multiple_parallel}}
};
use std::fs::write;

fn get_last_login_user() -> Result<String, Box<dyn Error>> {
    let config = AppConfig::load_valrant_config()?;
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
    debug!("Last login user: {}", last_login_user);
    Ok(last_login_user)
}

pub fn get_last_login_user_folder() -> Result<String, Box<dyn Error>> {
    let user_name = get_last_login_user()?;
    let game_path = AppConfig::load_valrant_config()?.game_path;
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
    debug!("Last login user folder: {}", user_name_folder);
    Ok(user_name_folder)
}

pub fn modify_game_resolution_config(settings_path: PathBuf) -> Result<(), Box<dyn Error>> {
    let config = AppConfig::load_watcher_config()?;
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
