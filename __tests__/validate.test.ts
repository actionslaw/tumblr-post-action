import { InvalidField, ValidationsFailed } from '../src/validate'
import * as Validate from '../src/validate'
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

describe('Validate.all', () => {
  it('validates all required field', () => {
    const validated = Validate.all([
      Validate.required('field1', 'test-key-1'),
      Validate.required('field2', 'test-key-2')
    ])

    expect(validated).toStrictEqualRight(['test-key-1', 'test-key-2'])
  })

  it('return invalid when validations fail', () => {
    const expectedErrors = [
      new InvalidField('field1', 'missing'),
      new InvalidField('field2', 'missing')
    ]

    const validated = Validate.all([
      Validate.required('field1', undefined),
      Validate.required('field2', undefined)
    ])

    expect(validated).toStrictEqualLeft(new ValidationsFailed(expectedErrors))
  })

  it('return invalid when some validations fail', () => {
    const expectedErrors = [new InvalidField('field1', 'missing')]

    const validated = Validate.all([
      Validate.required('field1', undefined),
      Validate.required('field2', 'test-input')
    ])

    expect(validated).toStrictEqualLeft(new ValidationsFailed(expectedErrors))
  })
})
