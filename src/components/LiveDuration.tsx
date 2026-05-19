import { useEffect, useState } from "react";
import { formatDuration, secondsBetween } from "../lib/format";

type Props = {
  baseSeconds: number;
  runningSince: string | null;
  className?: string;
};

export function LiveDuration({ baseSeconds, runningSince, className }: Props) {
  const [, tick] = useState(0);

  useEffect(() => {
    if (!runningSince) return;
    const id = window.setInterval(() => tick((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, [runningSince]);

  const live = runningSince
    ? baseSeconds + secondsBetween(runningSince, null)
    : baseSeconds;

  return <span className={className}>{formatDuration(live)}</span>;
}
