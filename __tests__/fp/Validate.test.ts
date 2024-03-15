import { Validate } from '../../src/fp'

describe('Validate', () => {
  it('validate', async () => {
    const validator = Validate.required<number>("test")
    const valid = yield validator(1)
  })
})
