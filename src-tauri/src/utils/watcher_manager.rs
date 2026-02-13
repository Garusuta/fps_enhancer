use std::{path::Path, sync::{
    Arc, atomic::{AtomicBool, Ordering}
}};

use sysinfo::{ProcessesToUpdate, System};
use tokio::{
    sync::Mutex,
    task::JoinHandle,
    time::{interval, Duration},
};
use tracing::{info, warn};

use crate::utils::display_manager::{DisplayMode, change_display_mode, restore_default_settings};


pub struct ProcessWatcher {
    pub process_path: String,
    pub display_mode: DisplayMode,
    is_running: Arc<AtomicBool>,
    pub(crate) task: Mutex<Option<JoinHandle<()>>>,
}

impl ProcessWatcher {
    pub fn new(process_path: String, display_mode: DisplayMode) -> Self {
        Self {
            process_path,
            display_mode,
            is_running: Arc::new(AtomicBool::new(false)),
            task: Mutex::new(None),
        }
    }

    pub fn is_running(&self) -> bool {
        self.is_running.load(Ordering::Relaxed)
    }

    pub async fn start(&self) {
        let mut task_guard = self.task.lock().await;

        if task_guard.is_some() {
            warn!("{} already watching, skipping", self.process_path);
            return;
        }

        let process_path = self.process_path.clone();
        let display_mode = self.display_mode.clone();
        let is_running = self.is_running.clone();

        let task = tokio::spawn(async move {
            info!("Start watching process: {}", process_path);

            let mut ticker = interval(Duration::from_secs(2));
            let mut system = System::new_all();

            let on_start = || {
                let _ = change_display_mode(&display_mode, false);
            };
            let on_stop = || {
                let _ = restore_default_settings();
            };

            loop {
                ticker.tick().await;

                system.refresh_processes(ProcessesToUpdate::All, true);

                let running_now = system
                    .processes()
                    .iter()
                    .any(|(_, p)| p.exe().unwrap_or(Path::new("s")).to_string_lossy().into_owned() == process_path);

                let running_prev = is_running.swap(running_now, Ordering::Relaxed);

                if running_prev != running_now {
                    if running_now {
                        (on_start)();
                    } else {
                        (on_stop)();
                    }
                }
            }
        });

        *task_guard = Some(task);
    }

    pub async fn stop(&self) {
        let mut task_guard = self.task.lock().await;

        if let Some(task) = task_guard.take() {
            info!("{} begins to stop watching", self.process_path);
            task.abort();
        } else {
            warn!("{} not in watching", self.process_path);
        }
    }
}
