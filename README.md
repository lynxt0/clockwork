# Clockwork

A small, minimal desktop time tracker. Clock on and off your projects and tasks like flicking a switch.

Built with Tauri + React + TypeScript + SQLite. Runs natively on Linux and Windows. Tiny installer (~5 MB), no Electron bloat.

---

## Features

- **Projects & Tasks** — Create projects, add tasks inside each
- **Flip-switch timer** — Toggle a task to start/stop tracking; only one runs at a time
- **Session history** — Every start/stop is recorded; review per-task timelines
- **Live totals** — Running totals tick up live across project and task views
- **System tray** — Click the tray icon to show/hide the window
- **Frameless window** — Custom title bar, draggable from the top, resizable from any edge
- **Local-first** — All data stays in a local SQLite file. No accounts, no cloud, no telemetry

---

## Install

### Windows

Grab the latest `.exe` from [Releases](https://github.com/lynxt0/clockwork/releases/latest) and run it.

Windows SmartScreen will likely warn you (the binary isn't code-signed) — click **More info → Run anyway**.

### Linux

Download from [Releases](https://github.com/lynxt0/clockwork/releases/latest):

- **`.deb`** (Ubuntu / Mint / Debian): `sudo dpkg -i clockwork_*.deb`
- **`.AppImage`** (any distro): `chmod +x clockwork_*.AppImage && ./clockwork_*.AppImage`

After installing the `.deb`, Clockwork appears in your application menu. Right-click → *Add to favorites* (Cinnamon) or *Pin to taskbar* (GNOME/KDE).

---

## Develop

Requires Node 20+, pnpm, Rust, and the Tauri Linux deps.

```bash
pnpm install
pnpm tauri dev      # run with hot reload
pnpm tauri build    # produce installers in src-tauri/target/release/bundle/
```

---

## Data

A SQLite file is stored in the app data directory:

- Linux: `~/.local/share/com.caleb.clockwork/clockwork.db`
- Windows: `%APPDATA%/com.caleb.clockwork/clockwork.db`

Back this up if you care about your history.

---

## License

MIT
