import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { TitleBar } from "../components/TitleBar";
import { LiveDuration } from "../components/LiveDuration";
import {
  createProject,
  deleteProject,
  listAreasPlain,
  listProjects,
} from "../lib/queries";
import {
  PROJECT_COLOURS,
  type Area,
  type ProjectWithTotal,
} from "../lib/types";
import { useApp } from "../store";

export function Home() {
  const [projects, setProjects] = useState<ProjectWithTotal[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState("");
  const [colour, setColour] = useState<string>(PROJECT_COLOURS[0]);
  const [areaId, setAreaId] = useState<string | null>(null);
  const running = useApp((s) => s.running);
  const goProject = useApp((s) => s.goProject);
  const goAreas = useApp((s) => s.goAreas);
  const goStats = useApp((s) => s.goStats);

  const refresh = async () => {
    const [ps, as] = await Promise.all([listProjects(), listAreasPlain()]);
    setProjects(ps);
    setAreas(as);
  };

  useEffect(() => {
    refresh();
  }, [running?.entryId]);

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await createProject(trimmed, colour, areaId);
    setName("");
    setColour(PROJECT_COLOURS[0]);
    setAreaId(null);
    setShowNew(false);
    refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project and all its tasks?")) return;
    await deleteProject(id);
    refresh();
  };

  return (
    <div className="flex h-full flex-col">
      <TitleBar />

      <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-text-dim">
            Projects
          </div>
          <div className="text-base font-semibold text-text">
            {projects.length === 0
              ? "Nothing tracked yet"
              : `${projects.length} project${projects.length === 1 ? "" : "s"}`}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={goStats}
            className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:bg-bg-hover hover:text-text"
            aria-label="Stats"
            title="Stats"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="6" y1="20" x2="6" y2="12" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="18" y1="20" x2="18" y2="8" />
            </svg>
          </button>
          <button
            type="button"
            onClick={goAreas}
            className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:bg-bg-hover hover:text-text"
            aria-label="Areas"
            title="Areas"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setShowNew((v) => !v)}
            className="flex h-8 items-center gap-1.5 rounded-md bg-accent px-3 text-xs font-medium text-white hover:bg-accent-hover"
          >
            <span className="text-base leading-none">+</span> New
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showNew && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-border/40"
          >
            <div className="space-y-3 px-4 py-3">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="Project name"
                className="w-full rounded-md border border-border bg-bg-elevated px-3 py-2 text-sm text-text placeholder:text-text-dim focus:border-accent focus:outline-none"
              />
              <div className="flex items-center gap-2">
                {PROJECT_COLOURS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColour(c)}
                    className={`h-5 w-5 rounded-full transition-transform ${
                      colour === c ? "scale-110 ring-2 ring-white/40" : ""
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={`Pick colour ${c}`}
                  />
                ))}
              </div>
              {areas.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-text-dim">
                    Area
                  </span>
                  <button
                    type="button"
                    onClick={() => setAreaId(null)}
                    className={`rounded-full border px-2 py-0.5 text-[11px] ${
                      areaId === null
                        ? "border-accent text-text"
                        : "border-border/60 text-text-dim hover:text-text"
                    }`}
                  >
                    None
                  </button>
                  {areas.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setAreaId(a.id)}
                      className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] ${
                        areaId === a.id
                          ? "border-accent text-text"
                          : "border-border/60 text-text-muted hover:text-text"
                      }`}
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: a.colour }}
                      />
                      {a.name}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNew(false)}
                  className="rounded-md px-3 py-1.5 text-xs text-text-muted hover:bg-bg-hover"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreate}
                  className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-hover"
                >
                  Create
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto">
        {projects.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <div className="mb-3 text-3xl">⏱</div>
            <div className="text-sm text-text-muted">
              Create your first project to start tracking time.
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-border/40">
            {projects.map((p) => {
              const isRunning = running?.projectId === p.id;
              return (
                <motion.li
                  layout
                  key={p.id}
                  className="group flex items-center gap-3 px-4 py-3 hover:bg-bg-hover"
                >
                  <button
                    type="button"
                    onClick={() => goProject(p.id)}
                    className="flex flex-1 items-center gap-3 text-left"
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: p.colour }}
                    />
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center gap-2 truncate text-sm font-medium text-text">
                        {p.name}
                        {isRunning && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-running">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-running" />
                            Live
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-text-dim">
                        {p.task_count} task{p.task_count === 1 ? "" : "s"}
                      </div>
                    </div>
                    <LiveDuration
                      baseSeconds={p.total_seconds}
                      runningSince={isRunning ? running.startedAt : null}
                      className="font-mono text-xs tabular-nums text-text-muted"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-text-dim opacity-0 transition-opacity hover:bg-bg hover:text-danger group-hover:opacity-100"
                    aria-label="Delete project"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </motion.li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
