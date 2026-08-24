import { runNoopJob } from './noop-job.js'

const version = process.env['WORKER_VERSION'] ?? '0.0.0'

console.info(runNoopJob(version))
