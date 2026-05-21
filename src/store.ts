import { create } from "zustand";
import {
  getRunningEntry,
  startTimer as dbStart,
  stopTimer as dbStop,
} from "./lib/queries";

type Screen =
  | { kind: "home" }
  | { kind: "project"; projectId: string }
  | { kind: "task"; taskId: string; projectId: string }
  | { kind: "areas" }
  | { kind: "stats" };

type RunningState = {
  entryId: string;
  taskId: string;
  projectId: string;
  startedAt: string;
} | null;

type AppState = {
  screen: Screen;
  running: RunningState;
  hydrated: boolean;
  goHome: () => void;
  goProject: (projectId: string) => void;
  goTask: (taskId: string, projectId: string) => void;
  goAreas: () => void;
  goStats: () => void;
  hydrate: () => Promise<void>;
  startTask: (taskId: string) => Promise<void>;
  stopActive: () => Promise<void>;
};

export const useApp = create<AppState>((set, get) => ({
  screen: { kind: "home" },
  running: null,
  hydrated: false,
  goHome: () => set({ screen: { kind: "home" } }),
  goProject: (projectId) => set({ screen: { kind: "project", projectId } }),
  goTask: (taskId, projectId) =>
    set({ screen: { kind: "task", taskId, projectId } }),
  goAreas: () => set({ screen: { kind: "areas" } }),
  goStats: () => set({ screen: { kind: "stats" } }),

  hydrate: async () => {
    const running = await getRunningEntry();
    set({
      running: running
        ? {
            entryId: running.entry_id,
            taskId: running.task_id,
            projectId: running.project_id,
            startedAt: running.started_at,
          }
        : null,
      hydrated: true,
    });
  },

  startTask: async (taskId) => {
    const entry = await dbStart(taskId);
    set({
      running: {
        entryId: entry.entry_id,
        taskId: entry.task_id,
        projectId: entry.project_id,
        startedAt: entry.started_at,
      },
    });
  },

  stopActive: async () => {
    const current = get().running;
    if (!current) return;
    await dbStop(current.entryId);
    set({ running: null });
  },
}));
