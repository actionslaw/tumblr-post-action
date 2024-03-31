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
  it('validates required field', async () => {
    const validated = await Validate.requiredF(Effect, 'field')('test-input')()
    expect(validated).toEqualRight('test-input')
  })
})

describe('Validate.stringArray', () => {
  it('validates valid array', () => {
    const validArray = '["test-input1", "test-input2"]'

    const validated = Validate.stringArray('field', validArray)

    expect(validated).toEqualRight(['test-input1', 'test-input2'])
  })

  it('validates empty string', () => {
    const validated = Validate.stringArray('field', '')
    expect(validated).toEqualRight([])
  })

  it('returns invalid on invalid array string', () => {
    const expectedError = new InvalidField('field', 'invalid-array')

    const validated = Validate.stringArray('field', 'non-array')

    expect(validated).toEqualLeft(expectedError)
  })

  it('returns invalid on non-array', () => {
    const expectedError = new InvalidField('field', 'invalid-array')

    const validated = Validate.stringArray('field', '{"key": "val"}')

    expect(validated).toEqualLeft(expectedError)
  })

  it('returns invalid on non-sting array', () => {
    const expectedError = new InvalidField('field', 'invalid-array')

    const validated = Validate.stringArray('field', '[1,2]')

    expect(validated).toEqualLeft(expectedError)
  })
})

describe('Validate.stringArrayF', () => {
  it('validates valid array', async () => {
    const validArray = '["test-input1", "test-input2"]'

    const validated = await Validate.stringArrayF(Effect, 'field')(validArray)()

    expect(validated).toEqualRight(['test-input1', 'test-input2'])
  })
})
