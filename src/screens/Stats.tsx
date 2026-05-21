import { useEffect, useMemo, useState } from "react";
import { TitleBar } from "../components/TitleBar";
import { listStatsEntries } from "../lib/queries";
import { formatDuration } from "../lib/format";
import type { StatsEntry } from "../lib/types";
import { useApp } from "../store";

type Bucket = {
  key: string;
  name: string;
  colour: string;
  today: number;
  week: number;
  all: number;
};

function secondsInWindow(
  startIso: string,
  endIso: string | null,
  winStart: number,
  winEnd: number,
): number {
  const start = new Date(startIso).getTime();
  const end = endIso ? new Date(endIso).getTime() : Date.now();
  const lo = Math.max(start, winStart);
  const hi = Math.min(end, winEnd);
  return Math.max(0, Math.floor((hi - lo) / 1000));
}

function getWindows() {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const day = (now.getDay() + 6) % 7;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - day);
  weekStart.setHours(0, 0, 0, 0);

  const nowMs = now.getTime();
  return {
    today: { start: todayStart.getTime(), end: nowMs },
    week: { start: weekStart.getTime(), end: nowMs },
    all: { start: 0, end: nowMs },
  };
}

export function Stats() {
  const [entries, setEntries] = useState<StatsEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const goHome = useApp((s) => s.goHome);
  const running = useApp((s) => s.running);

  useEffect(() => {
    listStatsEntries().then((rows) => {
      setEntries(rows);
      setLoaded(true);
    });
  }, [running?.entryId]);

  const { totals, byProject, byArea } = useMemo(() => {
    const w = getWindows();
    let today = 0;
    let week = 0;
    let all = 0;
    const projectMap = new Map<string, Bucket>();
    const areaMap = new Map<string, Bucket>();

    for (const e of entries) {
      const t = secondsInWindow(e.started_at, e.ended_at, w.today.start, w.today.end);
      const wk = secondsInWindow(e.started_at, e.ended_at, w.week.start, w.week.end);
      const a = secondsInWindow(e.started_at, e.ended_at, w.all.start, w.all.end);

      today += t;
      week += wk;
      all += a;

      const pKey = e.project_id;
      const pb = projectMap.get(pKey) ?? {
        key: pKey,
        name: e.project_name,
        colour: e.project_colour,
        today: 0,
        week: 0,
        all: 0,
      };
      pb.today += t;
      pb.week += wk;
      pb.all += a;
      projectMap.set(pKey, pb);

      const aKey = e.area_id ?? "__none__";
      const ab = areaMap.get(aKey) ?? {
        key: aKey,
        name: e.area_name ?? "Unassigned",
        colour: e.area_colour ?? "#5a5a63",
        today: 0,
        week: 0,
        all: 0,
      };
      ab.today += t;
      ab.week += wk;
      ab.all += a;
      areaMap.set(aKey, ab);
    }

    return {
      totals: { today, week, all },
      byProject: [...projectMap.values()].sort((a, b) => b.all - a.all),
      byArea: [...areaMap.values()].sort((a, b) => b.all - a.all),
    };
  }, [entries]);

  return (
    <div className="flex h-full flex-col">
      <TitleBar onBack={goHome} />

      <div className="border-b border-border/40 px-4 py-3">
        <div className="text-[10px] uppercase tracking-[0.18em] text-text-dim">
          Stats
        </div>
        <div className="text-base font-semibold text-text">Time overview</div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!loaded ? (
          <div className="flex h-full items-center justify-center text-xs text-text-dim">
            Loading…
          </div>
        ) : entries.length === 0 ? (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-text-muted">
            No time tracked yet. Start a timer to see stats here.
          </div>
        ) : (
          <div className="space-y-6 px-4 py-4">
            <Snapshot
              today={totals.today}
              week={totals.week}
              all={totals.all}
            />

            <Section title="By Area" buckets={byArea} />
            <Section title="By Project" buckets={byProject} />
          </div>
        )}
      </div>
    </div>
  );
}

function Snapshot({
  today,
  week,
  all,
}: {
  today: number;
  week: number;
  all: number;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <StatCard label="Today" seconds={today} accent="text-running" />
      <StatCard label="This week" seconds={week} accent="text-accent" />
      <StatCard label="All time" seconds={all} accent="text-text" />
    </div>
  );
}

function StatCard({
  label,
  seconds,
  accent,
}: {
  label: string;
  seconds: number;
  accent: string;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-bg-elevated px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wider text-text-dim">
        {label}
      </div>
      <div className={`mt-0.5 font-mono text-base tabular-nums ${accent}`}>
        {formatDuration(seconds)}
      </div>
    </div>
  );
}

function Section({ title, buckets }: { title: string; buckets: Bucket[] }) {
  const max = Math.max(1, ...buckets.map((b) => b.all));
  return (
    <div>
      <div className="mb-2 text-[10px] uppercase tracking-wider text-text-dim">
        {title}
      </div>

      <div className="space-y-1.5">
        {buckets.map((b) => (
          <div key={b.key} className="space-y-0.5">
            <div className="flex items-center gap-2 text-xs">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: b.colour }}
              />
              <span className="flex-1 truncate text-text">{b.name}</span>
              <span className="font-mono tabular-nums text-text-muted">
                {formatDuration(b.all)}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-elevated">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(b.all / max) * 100}%`,
                  backgroundColor: b.colour,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 overflow-hidden rounded-md border border-border/60">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-bg-elevated text-text-dim">
              <th className="px-2 py-1.5 text-left font-medium">Name</th>
              <th className="px-2 py-1.5 text-right font-medium">Today</th>
              <th className="px-2 py-1.5 text-right font-medium">Week</th>
              <th className="px-2 py-1.5 text-right font-medium">All</th>
            </tr>
          </thead>
          <tbody>
            {buckets.map((b) => (
              <tr key={b.key} className="border-t border-border/40">
                <td className="px-2 py-1.5">
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: b.colour }}
                    />
                    <span className="truncate text-text">{b.name}</span>
                  </div>
                </td>
                <td className="px-2 py-1.5 text-right font-mono tabular-nums text-text-muted">
                  {b.today > 0 ? formatDuration(b.today) : "—"}
                </td>
                <td className="px-2 py-1.5 text-right font-mono tabular-nums text-text-muted">
                  {b.week > 0 ? formatDuration(b.week) : "—"}
                </td>
                <td className="px-2 py-1.5 text-right font-mono tabular-nums text-text">
                  {formatDuration(b.all)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
