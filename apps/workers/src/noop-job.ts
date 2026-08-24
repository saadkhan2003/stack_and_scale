export type NoopJobResult = Readonly<{
  job: "noop";
  status: "completed";
  workerVersion: string;
}>;

export function runNoopJob(workerVersion: string): NoopJobResult {
  if (workerVersion.trim().length === 0) {
    throw new Error("worker version must not be empty");
  }

  return {
    job: "noop",
    status: "completed",
    workerVersion,
  };
}
