use std::{collections::HashMap, ffi::OsStr, mem, os::windows::ffi::OsStrExt};

use thiserror::Error;
use tracing::debug;
use windows::{core::PCWSTR, Win32::Graphics::Gdi::*};

#[derive(Error, Debug)]
pub enum DisplayError {
    #[error("Failed to enumerate display settings.")]
    EnumFailed,
    #[error("Failed to change display settings: {0}")]
    ChangeFailed(String),
}

#[derive(Debug, Clone)]
pub struct DisplayMode {
    pub width: u32,
    pub height: u32,
    pub refresh_rate: u32,
}

pub fn get_current_display_mode() -> Result<DisplayMode, DisplayError> {
    unsafe {
        let mut devmode: DEVMODEW = mem::zeroed();
        devmode.dmSize = mem::size_of::<DEVMODEW>() as u16;
        debug!(
            "DEVMODEW size: {} bytes, as u16: {}",
            mem::size_of::<DEVMODEW>(),
            mem::size_of::<DEVMODEW>() as u16
        );

        // 枚举指定显示设备的显示模式
        let result = EnumDisplaySettingsW(
            PCWSTR::null(),        // 默认显示器
            ENUM_CURRENT_SETTINGS, // 当前正在使用的显示设置
            &mut devmode,          // 函数将填充此结构体
        );
        debug!("EnumDisplaySettingsW result: {:?}", result);

        if result.as_bool() {
            Ok(DisplayMode {
                width: devmode.dmPelsWidth,
                height: devmode.dmPelsHeight,
                refresh_rate: devmode.dmDisplayFrequency,
            })
        } else {
            Err(DisplayError::EnumFailed)
        }
    }
}

pub fn change_display_mode(mode: &DisplayMode, permanent: bool) -> Result<(), DisplayError> {
    unsafe {
        let mut devmode: DEVMODEW = mem::zeroed();
        devmode.dmSize = mem::size_of::<DEVMODEW>() as u16;
        devmode.dmPelsWidth = mode.width;
        devmode.dmPelsHeight = mode.height;
        devmode.dmDisplayFrequency = mode.refresh_rate;
        devmode.dmFields = DM_PELSWIDTH | DM_PELSHEIGHT | DM_DISPLAYFREQUENCY; // 指示有效字段
        debug!(
            "DEVMODEW size: {} bytes, as u16: {}",
            mem::size_of::<DEVMODEW>(),
            mem::size_of::<DEVMODEW>() as u16
        );

        let test_result = ChangeDisplaySettingsW(Some(&devmode), CDS_TEST);
        debug!("ChangeDisplaySettingsW (test) result: {:?}", test_result);

        if test_result != DISP_CHANGE_SUCCESSFUL {
            return Err(DisplayError::ChangeFailed(format!(
                "Test Failed: {:?}",
                test_result
            )));
        }

        // 除了CDS_UPDATEREGISTRY，其他标志都是临时的，系统重启后会恢复默认设置
        let flags = if permanent {
            CDS_UPDATEREGISTRY // 更新到注册表
        } else {
            CDS_TYPE(0) // 不是任何标志（空）
        };
        debug!("Changing display settings with flags: {:?}", flags);

        let result = ChangeDisplaySettingsW(Some(&devmode), flags);
        debug!("ChangeDisplaySettingsW result: {:?}", result);

        match result {
            DISP_CHANGE_SUCCESSFUL => Ok(()),
            DISP_CHANGE_RESTART => Err(DisplayError::ChangeFailed(
                "System restart required".to_string(),
            )),
            DISP_CHANGE_BADMODE => Err(DisplayError::ChangeFailed(
                "The graphics mode is not supported".to_string(),
            )),
            _ => Err(DisplayError::ChangeFailed(format!(
                "Unknown error: {:?}",
                result
            ))),
        }
    }
}

pub fn change_display_mode_for_monitor(
    device_name: String,
    mode: &DisplayMode,
    permanent: bool,
) -> Result<(), DisplayError> {
    let device_name_wide: Vec<u16> = OsStr::new(&device_name)
        .encode_wide()
        .chain(std::iter::once(0))
        .collect();
    debug!("Device name wide: {:?}", device_name_wide);

    unsafe {
        let mut devmode: DEVMODEW = mem::zeroed();
        devmode.dmSize = mem::size_of::<DEVMODEW>() as u16;
        devmode.dmPelsWidth = mode.width;
        devmode.dmPelsHeight = mode.height;
        devmode.dmDisplayFrequency = mode.refresh_rate;
        devmode.dmFields = DM_PELSWIDTH | DM_PELSHEIGHT | DM_DISPLAYFREQUENCY;
        debug!(
            "DEVMODEW size: {} bytes, as u16: {}",
            mem::size_of::<DEVMODEW>(),
            mem::size_of::<DEVMODEW>() as u16
        );

        let test_result = ChangeDisplaySettingsExW(
            PCWSTR::from_raw(device_name_wide.as_ptr()),
            Some(&devmode),
            None,
            CDS_TEST,
            None,
        );
        debug!("ChangeDisplaySettingsExW (test) result: {:?}", test_result);

        if test_result != DISP_CHANGE_SUCCESSFUL {
            return Err(DisplayError::ChangeFailed(format!(
                "Test Failed: {:?}",
                test_result
            )));
        }

        let flags = if permanent {
            CDS_UPDATEREGISTRY
        } else {
            CDS_TYPE(0)
        };
        debug!("Changing display settings with flags: {:?}", flags);

        let result = ChangeDisplaySettingsExW(
            PCWSTR::from_raw(device_name_wide.as_ptr()),
            Some(&devmode),
            None,
            flags,
            None,
        );
        debug!("ChangeDisplaySettingsExW result: {:?}", result);

        match result {
            DISP_CHANGE_SUCCESSFUL => Ok(()),
            DISP_CHANGE_RESTART => Err(DisplayError::ChangeFailed(
                "System restart required".to_string(),
            )),
            DISP_CHANGE_BADMODE => Err(DisplayError::ChangeFailed(
                "The graphics mode is not supported".to_string(),
            )),
            _ => Err(DisplayError::ChangeFailed(format!(
                "Unknown error: {:?}",
                result
            ))),
        }
    }
}

pub fn restore_default_settings() -> Result<(), DisplayError> {
    unsafe {
        let result = ChangeDisplaySettingsW(None, CDS_TYPE(0));
        debug!("ChangeDisplaySettingsW result: {:?}", result);

        if result == DISP_CHANGE_SUCCESSFUL {
            Ok(())
        } else {
            Err(DisplayError::ChangeFailed(format!(
                "恢复失败: {:?}",
                result
            )))
        }
    }
}

pub fn enumerate_monitors() -> HashMap<String, String> {
    let mut monitors = HashMap::new();

    unsafe {
        let mut device: DISPLAY_DEVICEW = mem::zeroed();
        device.cb = mem::size_of::<DISPLAY_DEVICEW>() as u32;
        debug!(
            "DISPLAY_DEVICEW size: {} bytes, as u16: {}",
            mem::size_of::<DISPLAY_DEVICEW>(),
            mem::size_of::<DISPLAY_DEVICEW>() as u16
        );

        let mut device_index = 0u32;
        loop {
            debug!("Enumerating device index: {}", device_index);
            let result = EnumDisplayDevicesW(PCWSTR::null(), device_index, &mut device, 0);
            debug!("EnumDisplayDevicesW result: {:?}", result);

            if !result.as_bool() {
                debug!("No more devices found, breaking loop.");
                break;
            }

            // 检查是否是活动的显示器
            debug!("Device StateFlags: {:?}", device.StateFlags);
            if (device.StateFlags & DISPLAY_DEVICE_ACTIVE) != DISPLAY_DEVICE_STATE_FLAGS(0) {
                let monitor_name = String::from_utf16_lossy(
                    &device.DeviceName[..device
                        .DeviceName
                        .iter()
                        .position(|&c| c == 0)
                        .unwrap_or(device.DeviceName.len())],
                );
                let gpu_name = String::from_utf16_lossy(
                    &device.DeviceString[..device
                        .DeviceString
                        .iter()
                        .position(|&c| c == 0)
                        .unwrap_or(device.DeviceString.len())],
                );
                monitors.insert(monitor_name, gpu_name);
                debug!(
                    "Found active monitor: {}, using gpu name: {}",
                    String::from_utf16_lossy(&device.DeviceName),
                    String::from_utf16_lossy(&device.DeviceString)
                );
            }
            device_index += 1;
        }
        monitors
    }
}
