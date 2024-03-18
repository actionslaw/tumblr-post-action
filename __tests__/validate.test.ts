import { InvalidField, Validate, ValidationsFailed } from '../src/validate'

const fullStore = (field: string) => Promise.resolve(field)
const emptyStore = (_: string) => Promise.resolve(undefined)

describe('Validate', () => {
  describe('required validator', () => {
    const maybeValid = Validate.required('test-key')(fullStore)
    const maybeInValid = Validate.required('test-key')(emptyStore)

    it('validates required field', async () => {
      await expect(maybeValid).resolves.toBe('test-key')
    })

    it('throws validation error on missing field', async () => {
      await expect(maybeInValid).rejects.toBeInstanceOf(InvalidField)
    })

    it('throws error with invalidation metadata', async () => {
      await expect(maybeInValid).rejects.toEqual(
        expect.objectContaining({ field: 'test-key', code: 'missing' })
      )
    })
  })

  describe('check all validator', () => {
    const maybeValid = Validate.checkAll([
      Validate.required('test-key-1')(fullStore),
      Validate.required('test-key-2')(fullStore)
    ])

    const maybeInValid = Validate.checkAll([
      Validate.required('test-key-1')(emptyStore),
      Validate.required('test-key-2')(emptyStore)
    ])

    it('validates all required field', async () => {
      await expect(maybeValid).resolves.toStrictEqual([
        'test-key-1',
        'test-key-2'
      ])
    })

    it('throws validation error when all fields are invalid', async () => {
      await expect(maybeInValid).rejects.toBeInstanceOf(ValidationsFailed)
    })

    it('throws error with invalidation metadata', async () => {
      await expect(maybeInValid).rejects.toEqual(
        expect.objectContaining({
          errors: expect.arrayContaining([expect.any(InvalidField)])
        })
      )
    })

    const maybeSomeValid = Validate.checkAll([
      Validate.required('test-key-1')(emptyStore),
      Validate.required('test-key-2')(fullStore)
    ])

    it('throws validation error when some fields are invalid', async () => {
      await expect(maybeSomeValid).rejects.toBeInstanceOf(ValidationsFailed)
    })

    it('throws error with invalidation metadata when some fields are invlaid', async () => {
      await expect(maybeSomeValid).rejects.toEqual(
        expect.objectContaining({
          errors: expect.arrayContaining([expect.any(InvalidField)])
        })
      )
    })
  })
})
