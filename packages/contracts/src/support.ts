export type SupportPauseInterval = Readonly<{
  startedAt: string;
  endedAt?: string;
}>;

export type SlaClock = Readonly<{
  elapsedSeconds: number;
  pausedSeconds: number;
}>;

export function calculateSlaClock(input: {
  startedAt: string;
  now: string;
  pauseIntervals: readonly SupportPauseInterval[];
}): SlaClock {
  const started = Date.parse(input.startedAt);
  const now = Date.parse(input.now);
  if (Number.isNaN(started) || Number.isNaN(now) || now < started)
    throw new Error("SLA timestamps must be valid and ordered");
  const intervals = input.pauseIntervals
    .map((pause) => {
      const from = Math.max(started, Date.parse(pause.startedAt));
      const until = Math.min(
        now,
        pause.endedAt === undefined ? now : Date.parse(pause.endedAt),
      );
      if (Number.isNaN(from) || Number.isNaN(until) || until < from)
        throw new Error("SLA pause interval is invalid");
      return [from, until] as const;
    })
    .sort(([left], [right]) => left - right);
  let pausedMs = 0;
  let cursor = started;
  for (const [from, until] of intervals) {
    if (from > cursor) cursor = from;
    if (until > cursor) {
      pausedMs += until - cursor;
      cursor = until;
    }
  }
  return {
    elapsedSeconds: Math.floor((now - started - pausedMs) / 1000),
    pausedSeconds: Math.floor(pausedMs / 1000),
  };
}
