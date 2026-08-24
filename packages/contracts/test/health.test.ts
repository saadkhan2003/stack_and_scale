import assert from 'node:assert/strict'
import test from 'node:test'

import { createHealthContract } from '../src/index.ts'

test('createHealthContract returns the stable service health shape', () => {
  assert.deepEqual(createHealthContract('api', '0.0.0'), {
      service: 'api',
      status: 'ok',
      version: '0.0.0'
  })
})

test('createHealthContract rejects an empty service name', () => {
  assert.throws(() => createHealthContract('', '0.0.0'), /service must not be empty/)
})

test('createHealthContract rejects an empty version', () => {
  assert.throws(() => createHealthContract('api', ''), /version must not be empty/)
})
