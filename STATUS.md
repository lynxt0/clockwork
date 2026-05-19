# Clockwork — Status

Live snapshot of what's built, shipped, deferred, and known to be broken. Update as we go.

**Repo:** https://github.com/lynxt0/clockwork
**Latest release:** https://github.com/lynxt0/clockwork/releases/latest
**Stack:** Tauri 2 · React 19 · TypeScript · Tailwind v4 · Framer Motion · Zustand · SQLite (sqlx)

---

## Shipped

### App core
- [x] Tauri 2 + React + TypeScript scaffold (pnpm)
- [x] Tailwind v4 with custom dark theme tokens (`--color-bg`, `--color-accent`, etc.)
- [x] SQLite plugin (`tauri-plugin-sql`) with migrations
- [x] Local data path: `~/.local/share/com.caleb.clockwork/clockwork.db` (Linux) / `%APPDATA%/com.caleb.clockwork/clockwork.db` (Windows)

### Data model
- [x] `projects` (id, name, colour, created_at)
- [x] `tasks` (id, project_id, name, created_at)
- [x] `time_entries` (id, task_id, started_at, ended_at)
- [x] Foreign keys with `ON DELETE CASCADE`
- [x] Indexes on `tasks.project_id`, `time_entries.task_id`, partial index for running entries

### Screens
- [x] **Home** — projects list with live totals, coloured tags, create/delete
- [x] **Project detail** — task list with toggle-switch timers, create/delete tasks
- [x] **Task detail** — live total + session history with per-entry delete

### Timer behaviour
- [x] One global running entry at a time (starting a task auto-stops any other)
- [x] Live elapsed seconds tick across all screens via `LiveDuration`
- [x] Hydration on app start picks up an entry that was running when the app was last closed

### Window / chrome
- [x] Frameless 400×620 window with custom title bar
- [x] Tauri drag region on title bar (`data-tauri-drag-region`)
- [x] Edge + corner resize handles via `startResizeDragging`
- [x] System tray icon — left-click toggles visibility, right-click menu with Show/Quit
- [x] Min/Hide buttons in title bar

### Branding
- [x] Custom SVG app icon (violet clock on dark squircle) generated and rasterized to all required sizes (Linux PNGs, Windows `.ico`, macOS `.icns`, iOS/Android)
- [x] In-app "CLOCKWORK" wordmark with accent dot in the title bar

### Packaging & distribution
- [x] Linux `.deb` (5.9 MB) — Ubuntu/Mint/Debian
- [x] Linux `.AppImage` (79 MB) — portable any-distro
- [x] Linux `.rpm` — Fedora/RHEL
- [x] Windows `.exe` NSIS installer (3 MB)
- [x] Windows `.msi` installer (4 MB)
- [x] GitHub Actions workflow (`.github/workflows/release.yml`) — builds both platforms on `v*` tag push, attaches artifacts to a GitHub Release automatically
- [x] `.desktop` file for Linux menu integration (auto-installed by `.deb`)

### Repo hygiene
- [x] MIT license
- [x] README with install + dev instructions
- [x] `.gitignore` covering node_modules, dist, src-tauri/target
- [x] `pnpm.onlyBuiltDependencies` for esbuild postinstall

---

## Deferred / not yet built

- [ ] **Notion import** — pull projects/tasks from a Notion database via integration token. Plan was: settings screen → paste token → pick which DB maps to projects → one-way pull. Roughly a day of work.
- [ ] **CSV export** — dump time entries for a date range
- [ ] **Weekly summary view** — totals per project per week
- [ ] **Always-on-top toggle** — `tauri.conf.json` already supports it, just needs a settings UI
- [ ] **Persist window size/position** — currently re-centers at 400×620 every launch
- [ ] **Edit a task name / project name** — rename queries exist in `lib/queries.ts` but no UI yet
- [ ] **Edit a time entry's start/end** — common need for "forgot to clock off last night"
- [ ] **Idle detection** — pause/prompt when the machine is idle for N minutes
- [ ] **Keyboard shortcuts** — global hotkey to start/stop the current timer
- [ ] **Settings screen** — no settings UI exists yet; needed once we add any of the above

---

## Known issues / friction

- **Windows SmartScreen warning** — the `.exe` isn't code-signed. Users have to click "More info → Run anyway." Code signing requires a paid cert (~$100/yr) or self-signing + manual trust.
- **AppImage is 79 MB** — much larger than the `.deb` (5.9 MB) because it bundles its own webkit2gtk. Expected for AppImages; not fixable without a different format.
- **Right-click tray menu on Linux** — depends on `libayatana-appindicator3` being present. Already a dep on Mint/Ubuntu; some distros may need it installed.
- **DB schema is append-only so far** — first migration only. Any future schema changes need a new `Migration` entry in `src-tauri/src/lib.rs`.

---

## Tech / architecture decisions worth remembering

- **Why Tauri over Electron** — 5 MB installer vs ~100 MB, native webview, faster cold start, real Rust backend.
- **Why no router** — only three screens, transitions matter more than URLs. Zustand state machine is simpler and animates better with Framer Motion.
- **Why SQLite over JSON file** — concurrent writes are safe, queries aggregate totals on the DB side, easy to back up.
- **Why SVG icon** — vector renders crisp at 16×16 through 1024×1024 without per-size tuning. Source is `app-icon.svg`; regenerate platform sizes with `pnpm tauri icon app-icon.png`.

---

## How to ship a new release

1. Bump `version` in `package.json` and `src-tauri/tauri.conf.json`
2. Commit, push to `main`
3. `git tag vX.Y.Z && git push origin vX.Y.Z`
4. GitHub Actions builds Linux + Windows installers and creates the Release with assets attached (≈5 min)
