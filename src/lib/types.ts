export type Area = {
  id: string;
  name: string;
  colour: string;
  created_at: string;
};

export type Project = {
  id: string;
  name: string;
  colour: string;
  area_id: string | null;
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
  area_name: string | null;
  area_colour: string | null;
};

export type AreaWithTotal = Area & {
  total_seconds: number;
  project_count: number;
};

export type StatsEntry = {
  started_at: string;
  ended_at: string | null;
  project_id: string;
  project_name: string;
  project_colour: string;
  area_id: string | null;
  area_name: string | null;
  area_colour: string | null;
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
