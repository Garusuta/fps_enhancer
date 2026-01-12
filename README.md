# VALORANT 4:3 分辨率切换器

打无畏契约想用 4:3 拉伸？每次手动切分辨率太麻烦？这个工具帮你自动搞定。

游戏启动自动切 4:3，游戏关了自动切回去，就这么简单。

## 它能干啥

- 监听无畏契约进程，启动/关闭时自动切换分辨率
- 支持自定义分辨率和刷新率

## 使用前提

1. **必须用管理员权限运行**，不然没法改分辨率
2. 需要先在 NVIDIA 控制面板里添加好自定义分辨率（比如 1440x1080 或 1568x1080）
3. 缩放模式一定要设成「全屏」，由 GPU 执行缩放，并覆盖所有程序和游戏

## 配置文件

程序第一次运行会生成 `config.toml`：

```toml
[Desktop]
ResolutionSizeX = 1920
ResolutionSizeY = 1080
RefreshRate = 144

[Game]
ResolutionSizeX = 1568
ResolutionSizeY = 1080
RefreshRate = 144
```

- `Desktop` - 桌面分辨率，游戏关闭后恢复到这个
- `Game` - 游戏分辨率，检测到游戏启动就切到这个

刷新率别乱填，得是你显示器实际支持的。

## 常见 4:3 分辨率

| 分辨率    | 比例   | 说明     |
| --------- | ------ | -------- |
| 1440×1080 | 4:3    | 标准 4:3 |
| 1568×1080 | 约 4:3 | 稍宽一点 |
| 1280×960  | 4:3    | 低分辨率 |
| 1280×1024 | 5:4    | 接近 4:3 |

## 从源码编译

环境要求：

- Rust (stable)
- Node.js 18+
- npm / pnpm / yarn

```bash
# 克隆仓库
git clone https://github.com/Garusuta/valo43_tuner.git
cd valo43_tuner

# 安装前端依赖
npm i

# 开发模式
npm run tauri dev

# 打包
npm run tauri build
```

编译产物在 `src-tauri/target/release/` 目录下。

## 遇到问题？

**分辨率切换没反应**

- 确认用管理员权限运行了
- 确认 NVIDIA 控制面板里已经添加了对应的自定义分辨率

## 技术栈

- 后端：Rust
- 前端：Tauri + React + TypeScript

> **声明**：前端 UI 部分（Tauri + React + TypeScript）由 AI (Claude) 辅助开发，核心 Rust 逻辑为手写。

## 开源协议

GPL-3.0

你可以自由使用、修改、分发，但修改后的版本也必须开源。

---

有问题开 Issue，觉得好用给个 Star。

```

```
