import { describe, expect, it } from 'vitest'

import { runNoopJob } from '../src/noop-job.js'

describe('runNoopJob', () => {
  it('returns a completed job record for the requested worker version', () => {
    expect(runNoopJob('0.0.0')).toEqual({
      job: 'noop',
      status: 'completed',
      workerVersion: '0.0.0'
    })
  })

  it('rejects an empty worker version', () => {
    expect(() => runNoopJob('')).toThrow('worker version must not be empty')
  })
})
