export type Project = {
  id: string;
  name: string;
  colour: string;
  created_at: string;
};

export type Task = {
  id: string;
  project_id: string;
  name: string;
  created_at: string;
};

export type TimeEntry = {
  id: string;
  task_id: string;
  started_at: string;
  ended_at: string | null;
};

export type ProjectWithTotal = Project & {
  total_seconds: number;
  task_count: number;
};

export type TaskWithTotal = Task & {
  total_seconds: number;
  running_entry_id: string | null;
  running_started_at: string | null;
};

export const PROJECT_COLOURS = [
  "#7c5cff",
  "#34d399",
  "#f59e0b",
  "#f87171",
  "#60a5fa",
  "#ec4899",
  "#a78bfa",
  "#fbbf24",
] as const;
