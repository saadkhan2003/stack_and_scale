import { describe, expect, it } from 'vitest'

import { healthPageModel } from '../src/health-page.js'

describe('healthPageModel', () => {
  it('provides an accessible public service status message', () => {
    expect(healthPageModel).toEqual({
      heading: 'Stack & Scale platform',
      message: 'Public web shell is healthy.',
      status: 'ok'
    })
  })
})
