use std::{env::current_exe, path::PathBuf, sync::LazyLock};

pub static WORK_DIR: LazyLock<PathBuf> =
    LazyLock::new(|| current_exe().unwrap().parent().unwrap().to_path_buf());
pub static CONFIG_FILE: LazyLock<PathBuf> = LazyLock::new(|| {
    current_exe()
        .unwrap()
        .parent()
        .unwrap()
        .to_path_buf()
        .join("config.toml")
});
