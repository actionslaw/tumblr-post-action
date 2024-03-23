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

export function required<T>(field: string, input: T | undefined): Validated<T> {
  if (input) return E.right(input)
  else return E.left(new InvalidField(field, 'missing'))
}

function lift<F extends Effect.URIS, T>(
  M: Effect.MonadThrow<F>
): (validated: Validated<T>) => Effect.Kind<F, T> {
  return E.match<Error, T, Effect.Kind<F, T>>(
    (err: Error) => M.throwError(err),
    (head: T) => M.of(head)
  )
}

export function requiredF<F extends Effect.URIS, T>(
  M: Effect.MonadThrow<F>,
  field: string
): (_: T | undefined) => Effect.Kind<F, T> {
  return (input: T | undefined) => lift<F, T>(M)(required(field, input))
}
