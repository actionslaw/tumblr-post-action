import * as A from 'fp-ts/Array'
import * as E from 'fp-ts/Either'
import * as Effect from './effect'

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

// type Validator<S, T> = (field: string, input: S) => Validated<T>
// type ValidatorF<F extends URIS, S, T> = (
//   inputF: Kind<F, S>
// ) => (s: string) => Kind<F, T>

export function required<T>(field: string, input: T | undefined): Validated<T> {
  if (input) return E.right(input)
  else return E.left(new InvalidField(field, 'missing'))
}

export function requiredF<F extends Effect.URIS, T>(
  M: Effect.MonadThrow<F>,
  field: string,
  input: T | undefined
): Effect.Kind<F, T> {
  return E.match<Error, T, Effect.Kind<F, T>>(
    (err: Error) => M.throwError(err),
    (head: T) => M.of(head)
  )(required(field, input))
}

// type ValidatedF<F extends URIS, S, T> = (_: Kind<F, S>) => Kind<F, T>

// function fromEither<F extends URIS, A1>(
//   M: MonadThrow<F>,
//   either: E.Either<Error, A1>
// ): Kind<F, A1> {
//   return M.throwError<Error, A1>(new Error(''))
// const matcher = E.match<E1, A1, Kind<F, A1>>(
//   error => M.throwError<E1, A1>(error),
//   result => M.of(result)
// )
// return matcher(either)
// }

// console.log(fromEither(IOEither.MonadThrow, E.left(new Error('')))

// export function requiredF<F extends URIS, T>(
//   M: MonadThrow<F>,
//   field: string
// ): ValidatedF<F, T | undefined, T> {
//   return (input: Kind<F, T | undefined>) =>
//     M.chain(input, i => M.throwError(new InvalidField(field, 'missing')))
// }

export function all<T>(
  validations: Validated<T>[]
): E.Either<ValidationsFailed, T[]> {
  const separated = A.separate(validations)
  const errors = separated.left

  if (A.isNonEmpty(errors)) return ValidationsFailed.from(errors)
  else return E.right(separated.right)
}

// export function lift<F extends URIS, S, T>(
//   M: MonadThrow<F>,
//   validator: Validator<S, T>
// ): ValidatorF<F, S, T> {
//   M.throwError
//   return (inputF: Kind<F, S>) => (field: string, input: S) =>
//     M.chain(inputF, M.fromEither(validator(field, input))
// }
