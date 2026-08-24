import { Test } from '@nestjs/testing'
import { FastifyAdapter } from '@nestjs/platform-fastify'
import { describe, expect, it } from 'vitest'

import { AppModule } from '../src/app.module.js'

describe('GET /health', () => {
  it('returns a stable API health contract', async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()

    const app = module.createNestApplication(new FastifyAdapter())
    await app.init()

    const adapter = app.getHttpAdapter() as FastifyAdapter
    const fastify = adapter.getInstance()
    const response = await fastify.inject({
      method: 'GET',
      url: '/health'
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({
      service: 'api',
      status: 'ok',
      version: '0.0.0'
    })

    await app.close()
  })
})
