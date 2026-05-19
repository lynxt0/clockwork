import { db, nowIso, uid } from "./db";
import type {
  Project,
  ProjectWithTotal,
  Task,
  TaskWithTotal,
  TimeEntry,
} from "./types";

export async function listProjects(): Promise<ProjectWithTotal[]> {
  const conn = await db();
  return conn.select<ProjectWithTotal[]>(`
    SELECT
      p.*,
      COALESCE(SUM(
        CAST(
          (julianday(COALESCE(te.ended_at, datetime('now'))) - julianday(te.started_at)) * 86400
          AS INTEGER
        )
      ), 0) AS total_seconds,
      COUNT(DISTINCT t.id) AS task_count
    FROM projects p
    LEFT JOIN tasks t ON t.project_id = p.id
    LEFT JOIN time_entries te ON te.task_id = t.id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `);
}

export async function getProject(id: string): Promise<Project | null> {
  const conn = await db();
  const rows = await conn.select<Project[]>(
    "SELECT * FROM projects WHERE id = $1",
    [id],
  );
  return rows[0] ?? null;
}

export async function createProject(
  name: string,
  colour: string,
): Promise<Project> {
  const conn = await db();
  const project: Project = {
    id: uid(),
    name,
    colour,
    created_at: nowIso(),
  };
  await conn.execute(
    "INSERT INTO projects (id, name, colour, created_at) VALUES ($1, $2, $3, $4)",
    [project.id, project.name, project.colour, project.created_at],
  );
  return project;
}

export async function deleteProject(id: string): Promise<void> {
  const conn = await db();
  await conn.execute("DELETE FROM projects WHERE id = $1", [id]);
}

export async function renameProject(id: string, name: string): Promise<void> {
  const conn = await db();
  await conn.execute("UPDATE projects SET name = $1 WHERE id = $2", [name, id]);
}

export async function listTasks(projectId: string): Promise<TaskWithTotal[]> {
  const conn = await db();
  return conn.select<TaskWithTotal[]>(
    `
    SELECT
      t.*,
      COALESCE(SUM(
        CAST(
          (julianday(COALESCE(te.ended_at, datetime('now'))) - julianday(te.started_at)) * 86400
          AS INTEGER
        )
      ), 0) AS total_seconds,
      MAX(CASE WHEN te.ended_at IS NULL THEN te.id END) AS running_entry_id,
      MAX(CASE WHEN te.ended_at IS NULL THEN te.started_at END) AS running_started_at
    FROM tasks t
    LEFT JOIN time_entries te ON te.task_id = t.id
    WHERE t.project_id = $1
    GROUP BY t.id
    ORDER BY t.created_at DESC
    `,
    [projectId],
  );
}

export async function getTask(id: string): Promise<Task | null> {
  const conn = await db();
  const rows = await conn.select<Task[]>(
    "SELECT * FROM tasks WHERE id = $1",
    [id],
  );
  return rows[0] ?? null;
}

export async function createTask(
  projectId: string,
  name: string,
): Promise<Task> {
  const conn = await db();
  const task: Task = {
    id: uid(),
    project_id: projectId,
    name,
    created_at: nowIso(),
  };
  await conn.execute(
    "INSERT INTO tasks (id, project_id, name, created_at) VALUES ($1, $2, $3, $4)",
    [task.id, task.project_id, task.name, task.created_at],
  );
  return task;
}

export async function deleteTask(id: string): Promise<void> {
  const conn = await db();
  await conn.execute("DELETE FROM tasks WHERE id = $1", [id]);
}

export async function renameTask(id: string, name: string): Promise<void> {
  const conn = await db();
  await conn.execute("UPDATE tasks SET name = $1 WHERE id = $2", [name, id]);
}

export type RunningEntry = {
  entry_id: string;
  task_id: string;
  project_id: string;
  started_at: string;
};

export async function getRunningEntry(): Promise<RunningEntry | null> {
  const conn = await db();
  const rows = await conn.select<RunningEntry[]>(`
    SELECT te.id AS entry_id, te.task_id, t.project_id, te.started_at
    FROM time_entries te
    JOIN tasks t ON t.id = te.task_id
    WHERE te.ended_at IS NULL
    LIMIT 1
  `);
  return rows[0] ?? null;
}

export async function startTimer(taskId: string): Promise<RunningEntry> {
  const conn = await db();
  await conn.execute(
    "UPDATE time_entries SET ended_at = datetime('now') WHERE ended_at IS NULL",
  );
  const entry: TimeEntry = {
    id: uid(),
    task_id: taskId,
    started_at: nowIso(),
    ended_at: null,
  };
  await conn.execute(
    "INSERT INTO time_entries (id, task_id, started_at, ended_at) VALUES ($1, $2, $3, NULL)",
    [entry.id, entry.task_id, entry.started_at],
  );
  const task = await getTask(taskId);
  return {
    entry_id: entry.id,
    task_id: taskId,
    project_id: task?.project_id ?? "",
    started_at: entry.started_at,
  };
}

export async function stopTimer(entryId: string): Promise<void> {
  const conn = await db();
  await conn.execute(
    "UPDATE time_entries SET ended_at = $1 WHERE id = $2 AND ended_at IS NULL",
    [nowIso(), entryId],
  );
}

export async function stopAllTimers(): Promise<void> {
  const conn = await db();
  await conn.execute(
    "UPDATE time_entries SET ended_at = datetime('now') WHERE ended_at IS NULL",
  );
}

export async function listEntries(taskId: string): Promise<TimeEntry[]> {
  const conn = await db();
  return conn.select<TimeEntry[]>(
    "SELECT * FROM time_entries WHERE task_id = $1 ORDER BY started_at DESC",
    [taskId],
  );
}

export async function deleteEntry(id: string): Promise<void> {
  const conn = await db();
  await conn.execute("DELETE FROM time_entries WHERE id = $1", [id]);
}
