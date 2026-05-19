import { useEffect, useState } from "react";
import { LiveDuration } from "../components/LiveDuration";
import { TitleBar } from "../components/TitleBar";
import { Toggle } from "../components/Toggle";
import {
  deleteEntry,
  getTask,
  listEntries,
} from "../lib/queries";
import {
  formatDuration,
  formatRelative,
  secondsBetween,
} from "../lib/format";
import type { Task, TimeEntry } from "../lib/types";
import { useApp } from "../store";

type Props = { taskId: string; projectId: string };

export function TaskDetail({ taskId, projectId }: Props) {
  const [task, setTask] = useState<Task | null>(null);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const running = useApp((s) => s.running);
  const startTask = useApp((s) => s.startTask);
  const stopActive = useApp((s) => s.stopActive);
  const goProject = useApp((s) => s.goProject);

  const isRunning = running?.taskId === taskId;

  const refresh = async () => {
    const [t, es] = await Promise.all([getTask(taskId), listEntries(taskId)]);
    setTask(t);
    setEntries(es);
  };

  useEffect(() => {
    refresh();
  }, [taskId, running?.entryId]);

  const handleToggle = async () => {
    if (isRunning) {
      await stopActive();
    } else {
      await startTask(taskId);
    }
    refresh();
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm("Delete this time entry?")) return;
    await deleteEntry(id);
    refresh();
  };

  const totalCompleted = entries
    .filter((e) => e.ended_at)
    .reduce((sum, e) => sum + secondsBetween(e.started_at, e.ended_at), 0);

  return (
    <div className="flex h-full flex-col">
      <TitleBar onBack={() => goProject(projectId)} />

      <div className="border-b border-border/40 px-4 py-4">
        <div className="text-[10px] uppercase tracking-[0.18em] text-text-dim">
          Task
        </div>
        <div className="mb-3 truncate text-base font-semibold text-text">
          {task?.name ?? "Loading…"}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-text-dim">
              Total tracked
            </div>
            <LiveDuration
              baseSeconds={totalCompleted}
              runningSince={isRunning ? running.startedAt : null}
              className={`font-mono text-2xl tabular-nums ${
                isRunning ? "text-running" : "text-text"
              }`}
            />
          </div>
          <Toggle
            on={isRunning}
            onClick={handleToggle}
            ariaLabel={isRunning ? "Stop timer" : "Start timer"}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-2 text-[10px] uppercase tracking-wider text-text-dim">
          Sessions
        </div>
        {entries.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-text-muted">
            No sessions yet.
          </div>
        ) : (
          <ul className="divide-y divide-border/40">
            {entries.map((e) => {
              const live = !e.ended_at;
              const duration = secondsBetween(e.started_at, e.ended_at);
              return (
                <li
                  key={e.id}
                  className="group flex items-center justify-between px-4 py-2.5"
                >
                  <div className="flex-1 overflow-hidden">
                    <div className="truncate text-sm text-text">
                      {formatRelative(e.started_at)}
                    </div>
                    <div className="text-xs text-text-dim">
                      {live ? "Running" : "Completed"}
                    </div>
                  </div>
                  {live ? (
                    <LiveDuration
                      baseSeconds={0}
                      runningSince={e.started_at}
                      className="font-mono text-sm tabular-nums text-running"
                    />
                  ) : (
                    <span className="font-mono text-sm tabular-nums text-text-muted">
                      {formatDuration(duration)}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteEntry(e.id)}
                    className="ml-2 flex h-6 w-6 items-center justify-center rounded text-text-dim opacity-0 hover:bg-bg-hover hover:text-danger group-hover:opacity-100"
                    aria-label="Delete entry"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10">
                      <path
                        d="M1 1l8 8M9 1l-8 8"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
