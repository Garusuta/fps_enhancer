use std::io::stdout;
use std::path::PathBuf;
use std::process::Command;
use std::{collections::HashMap, error::Error};

use sysinfo::System;
use time::UtcOffset;
use tracing::debug;
use tracing_appender::rolling;
use tracing_subscriber::fmt::time::OffsetTime;
use tracing_subscriber::fmt::writer::MakeWriterExt;
use tracing_subscriber::EnvFilter;

use crate::constant::WORK_DIR;
use std::fs;
use std::time::{Duration, SystemTime};

pub fn init_logger() -> tracing_appender::non_blocking::WorkerGuard {
    cleanup_old_logs(WORK_DIR.to_str().unwrap(), 7);
    // 获取本地时区偏移量
    let local_offset = UtcOffset::current_local_offset().unwrap_or(UtcOffset::UTC); // 如果获取失败则回退到 UTC
    let format =
        time::format_description::parse("[year]-[month]-[day] [hour]:[minute]:[second]").unwrap();
    // 构建 Local Timer
    let timer = OffsetTime::new(local_offset, format);

    let file_appender = rolling::daily(WORK_DIR.as_path(), "app.log");
    let (non_blocking, guard) = tracing_appender::non_blocking(file_appender);
    let multi_writer = non_blocking.and(stdout);

    // 构建 EnvFilter (从环境变量 RUST_LOG 读取，默认 INFO)
    let env_filter = EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info"));

    tracing_subscriber::fmt()
        .with_env_filter(env_filter)
        .with_timer(timer)
        .with_writer(multi_writer)
        .with_ansi(false)
        .init();

    guard
}

fn cleanup_old_logs(dir: &str, days: u64) {
    let limit = Duration::from_secs(days * 24 * 60 * 60);
    let now = SystemTime::now();

    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_file() {
                if let Ok(metadata) = entry.metadata() {
                    if let Ok(modified) = metadata.modified() {
                        if now.duration_since(modified).unwrap_or(Duration::ZERO) > limit {
                            let _ = fs::remove_file(path); // 忽略删除失败的情况
                        }
                    }
                }
            }
        }
    }
}

pub fn replace_multiple_parallel(
    content: String,
    replacements: &HashMap<usize, String>,
) -> Result<String, Box<dyn Error>> {
    let mut lines: Vec<&str> = content.lines().collect();
    for (line_number, new_line) in replacements {
        if *line_number < lines.len() {
            lines[*line_number - 1] = new_line.as_str();
        } else {
            return Err(format!("Line number {} out of bounds", line_number).into());
        }
    }
    Ok(lines.join("\n"))
}

pub fn replace_single_parallel(
    content: String,
    line_number: usize,
    new_line: String,
) -> Result<String, Box<dyn Error>> {
    let mut lines: Vec<&str> = content.lines().collect();
    if line_number < lines.len() {
        lines[line_number - 1] = new_line.as_str();
        Ok(lines.join("\n"))
    } else {
        Err(format!("Line number {} out of bounds", line_number).into())
    }
}

/// Mode 0: insert before the line number.
///
/// Mode 1: insert after the line number.
pub fn insert_line_at(
    content: String,
    line_number: usize,
    mode: u32,
    new_line: String,
) -> Result<String, Box<dyn Error>> {
    let mut lines: Vec<&str> = content.lines().collect();
    if line_number <= lines.len() {
        if mode == 1 {
            lines.insert(line_number, new_line.as_str());
        } else if mode == 0 {
            lines.insert(line_number - 1, new_line.as_str());
        }
        Ok(lines.join("\n"))
    } else {
        Err(format!("Line number {} out of bounds", line_number).into())
    }
}

pub fn run_command(command: &[&str]) -> Result<String, Box<dyn Error>> {
    let output = Command::new("cmd").arg("/C").args(command).output()?;
    debug!("Running command: {:?}", command);
    if output.status.success() {
        let stdout = String::from_utf8(output.stdout)?;
        debug!("Command output: {}", stdout);
        Ok(stdout)
    } else {
        let stderr = String::from_utf8(output.stderr)?;
        debug!("Command error output: {}", stderr);
        Err(format!("Command failed: {}", stderr).into())
    }
}

pub fn get_running_process_path(process_name: &str) -> Option<PathBuf> {
    let system = System::new_all();

    let matches = system
        .processes()
        .iter()
        .filter(|(_, process)| process.name().eq_ignore_ascii_case(process_name))
        .map(|(_, process)| process)
        .collect::<Vec<_>>();

    match matches.len() {
        0 => {
            debug!("No running process found with name '{}'", process_name);
            None
        }
        1 => {
            if let Some(p) = matches[0].exe() {
                debug!("Found process '{}' at path: {:?}", process_name, p);
                Some(p.to_path_buf())
            } else {
                debug!("Process '{}' found but path is unavailable.", process_name);
                None
            }
        }
        _ => {
            let mut path = PathBuf::new();
            for process in matches {
                if let Some(p) = process.exe() {
                    if path.as_os_str().is_empty() {
                        path = p.to_path_buf();
                    } else {
                        if path != p.to_path_buf() {
                            debug!("Multiple instances of process '{}' found with different paths. Aborting.", process_name);
                            return None;
                        }
                    }
                }
            }
            debug!(
                "Duplicate process '{}' found with path: {:?}",
                process_name, path
            );
            Some(path)
        }
    }
}

#[tauri::command]
pub async fn hide_task() -> Result<(), String> {
    Ok(())
}
