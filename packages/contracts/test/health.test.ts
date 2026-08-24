import { describe, expect, it } from 'vitest'

import { createHealthContract } from '../src/index.js'

describe('createHealthContract', () => {
  it('returns the stable service health shape', () => {
    expect(createHealthContract('api', '0.0.0')).toEqual({
      service: 'api',
      status: 'ok',
      version: '0.0.0'
    })
  })

  it('rejects an empty service name', () => {
    expect(() => createHealthContract('', '0.0.0')).toThrow('service must not be empty')
  })

  it('rejects an empty version', () => {
    expect(() => createHealthContract('api', '')).toThrow('version must not be empty')
  })
})
