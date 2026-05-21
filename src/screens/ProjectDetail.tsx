import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { EditableText } from "../components/EditableText";
import { LiveDuration } from "../components/LiveDuration";
import { TitleBar } from "../components/TitleBar";
import { Toggle } from "../components/Toggle";
import {
  createTask,
  deleteTask,
  getProject,
  listAreasPlain,
  listTasks,
  renameProject,
  setProjectArea,
} from "../lib/queries";
import type { Area, Project, TaskWithTotal } from "../lib/types";
import { useApp } from "../store";

type Props = { projectId: string };

export function ProjectDetail({ projectId }: Props) {
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<TaskWithTotal[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [showAreaPicker, setShowAreaPicker] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState("");
  const running = useApp((s) => s.running);
  const startTask = useApp((s) => s.startTask);
  const stopActive = useApp((s) => s.stopActive);
  const goHome = useApp((s) => s.goHome);
  const goTask = useApp((s) => s.goTask);

  const refresh = async () => {
    const [p, ts, a] = await Promise.all([
      getProject(projectId),
      listTasks(projectId),
      listAreasPlain(),
    ]);
    setProject(p);
    setTasks(ts);
    setAreas(a);
  };

  useEffect(() => {
    refresh();
  }, [projectId, running?.entryId]);

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await createTask(projectId, trimmed);
    setName("");
    setShowNew(false);
    refresh();
  };

  const handleToggle = async (task: TaskWithTotal) => {
    const isRunning = running?.taskId === task.id;
    if (isRunning) {
      await stopActive();
    } else {
      await startTask(task.id);
    }
    refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this task and its time history?")) return;
    await deleteTask(id);
    refresh();
  };

  const totalSeconds = tasks.reduce((sum, t) => sum + t.total_seconds, 0);
  const runningInProject = running?.projectId === projectId ? running : null;

  return (
    <div className="flex h-full flex-col">
      <TitleBar onBack={goHome} />

      <div className="border-b border-border/40 px-4 py-3">
        <div className="flex items-center gap-3">
          <span
            className="h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: project?.colour ?? "#7c5cff" }}
          />
          <div className="min-w-0 flex-1">
            {project ? (
              <EditableText
                value={project.name}
                onSave={async (next) => {
                  await renameProject(project.id, next);
                  refresh();
                }}
                className="truncate text-base font-semibold text-text"
                inputClassName="w-full rounded-md border border-accent/40 bg-bg-elevated px-2 py-0.5 text-base font-semibold text-text outline-none focus:border-accent"
                ariaLabel="Edit project name"
              />
            ) : (
              <div className="text-base font-semibold text-text-muted">
                Loading…
              </div>
            )}
            <LiveDuration
              baseSeconds={totalSeconds}
              runningSince={runningInProject?.startedAt ?? null}
              className="font-mono text-xs tabular-nums text-text-muted"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowNew((v) => !v)}
            className="flex h-8 items-center gap-1.5 rounded-md bg-bg-elevated px-3 text-xs font-medium text-text hover:bg-bg-hover"
          >
            <span className="text-base leading-none">+</span> Task
          </button>
        </div>

        {project && (
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAreaPicker((v) => !v)}
              className="flex items-center gap-1.5 rounded-full border border-border/60 bg-bg-elevated px-2 py-0.5 text-[11px] text-text-muted hover:bg-bg-hover hover:text-text"
            >
              {project.area_id ? (
                <>
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor:
                        areas.find((a) => a.id === project.area_id)?.colour ??
                        "#7c5cff",
                    }}
                  />
                  {areas.find((a) => a.id === project.area_id)?.name ??
                    "Unknown area"}
                </>
              ) : (
                <span className="text-text-dim">No area</span>
              )}
            </button>
            <AnimatePresence>
              {showAreaPicker && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex flex-wrap gap-1"
                >
                  <button
                    type="button"
                    onClick={async () => {
                      await setProjectArea(project.id, null);
                      setShowAreaPicker(false);
                      refresh();
                    }}
                    className="rounded-full border border-border/60 px-2 py-0.5 text-[11px] text-text-dim hover:bg-bg-hover hover:text-text"
                  >
                    None
                  </button>
                  {areas.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={async () => {
                        await setProjectArea(project.id, a.id);
                        setShowAreaPicker(false);
                        refresh();
                      }}
                      className="flex items-center gap-1 rounded-full border border-border/60 px-2 py-0.5 text-[11px] text-text-muted hover:bg-bg-hover hover:text-text"
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: a.colour }}
                      />
                      {a.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showNew && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-border/40"
          >
            <div className="flex gap-2 px-4 py-3">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                  if (e.key === "Escape") setShowNew(false);
                }}
                placeholder="Task name"
                className="flex-1 rounded-md border border-border bg-bg-elevated px-3 py-2 text-sm text-text placeholder:text-text-dim focus:border-accent focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCreate}
                className="rounded-md bg-accent px-3 text-xs font-medium text-white hover:bg-accent-hover"
              >
                Add
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <div className="text-sm text-text-muted">
              No tasks yet. Add one to start the clock.
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-border/40">
            {tasks.map((t) => {
              const isRunning = running?.taskId === t.id;
              return (
                <motion.li
                  layout
                  key={t.id}
                  className={`group flex items-center gap-3 px-4 py-3 transition-colors ${
                    isRunning ? "bg-running/5" : "hover:bg-bg-hover"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => goTask(t.id, projectId)}
                    className="flex flex-1 flex-col items-start overflow-hidden text-left"
                  >
                    <div className="flex w-full items-center gap-2 truncate text-sm font-medium text-text">
                      {t.name}
                    </div>
                    <LiveDuration
                      baseSeconds={t.total_seconds}
                      runningSince={isRunning ? running.startedAt : null}
                      className={`font-mono text-xs tabular-nums ${
                        isRunning ? "text-running" : "text-text-dim"
                      }`}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(t.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-text-dim opacity-0 transition-opacity hover:bg-bg hover:text-danger group-hover:opacity-100"
                    aria-label="Delete task"
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
                  <Toggle
                    on={isRunning}
                    onClick={() => handleToggle(t)}
                    ariaLabel={isRunning ? "Stop timer" : "Start timer"}
                  />
                </motion.li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
