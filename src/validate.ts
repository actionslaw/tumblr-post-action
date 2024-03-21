import * as A from 'fp-ts/Array'
import * as E from 'fp-ts/Either'

export type Validated<T> = E.Either<InvalidField, T>

export class InvalidField extends Error {
  readonly field: string
  readonly code: string

  constructor(field: string, code: string) {
    super(`Field ${field} invalid (${code})`)
    this.field = field
    this.code = code
  }
}

export class ValidationsFailed extends Error {
  readonly errors: InvalidField[]

  constructor(errors: InvalidField[]) {
    const header = 'Validation failed with the following errors:'
    const message = [header].concat(errors.map(e => e.message)).join('\n\t')
    super(message)
    this.errors = errors
  }

  static from<T>(errors: InvalidField[]): E.Either<ValidationsFailed, T[]> {
    return E.left(new ValidationsFailed(errors))
  }
}

export function required<T>(field: string, input: T | undefined): Validated<T> {
  if (input) return E.right(input)
  else return E.left(new InvalidField(field, 'missing'))
}

export function all<T>(
  validations: Validated<T>[]
): E.Either<ValidationsFailed, T[]> {
  const separated = A.separate(validations)
  const errors = separated.left

  if (A.isNonEmpty(errors)) return ValidationsFailed.from(errors)
  else return E.right(separated.right)
}
