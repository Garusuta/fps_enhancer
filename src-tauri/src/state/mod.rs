use std::sync::Arc;

use tokio::sync::Mutex;

use crate::watcher::ProcessWatcher;

pub struct AppState {
    pub watcher: Arc<Mutex<Option<ProcessWatcher>>>,
}

impl AppState {
    pub fn new() -> Self {
        AppState {
            watcher: Arc::new(Mutex::new(None)),
        }
    }
}

impl Default for AppState {
    fn default() -> Self {
        Self::new()
    }
}
