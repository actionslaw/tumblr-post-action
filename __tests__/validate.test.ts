import { InvalidField } from '../src/validate'
import * as Validate from '../src/validate'
import { Effect } from '../src/effect'
import '@relmify/jest-fp-ts'

describe('Validate.required', () => {
  it('validates required field', () => {
    const validated = Validate.required('field', 'test-input')
    expect(validated).toEqualRight('test-input')
  })

  it('returns invalid on missing required field', () => {
    const expectedError = new InvalidField('field', 'missing')

    const validated = Validate.required('field', undefined)

    expect(validated).toStrictEqualLeft(expectedError)
  })
})

describe('Validate.requiredF', () => {
  it('validates required field', () => {
    const validated = Validate.requiredF(Effect, 'field')('test-input')()
    expect(validated).toEqualRight('test-input')
  })
})
