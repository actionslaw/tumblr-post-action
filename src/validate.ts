import * as E from 'fp-ts/Either'
import * as Effect from './effect'

export type Validated<T> = E.Either<InvalidField, T>

export class InvalidField extends Error {
  readonly field: string
  readonly code: string
  readonly cause?: unknown

  constructor(field: string, code: string, cause?: unknown) {
    super(`Field ${field} invalid (${code})`)
    this.field = field
    this.code = code
    this.cause = cause
  }
}

export function required<T>(field: string, input: T | undefined): Validated<T> {
  if (input) return E.right(input)
  else return E.left(new InvalidField(field, 'missing'))
}

function allStrings(array: unknown[]): boolean {
  return array.reduce<boolean>(
    (wasString, s) => wasString && typeof s == 'string',
    true
  )
}

export function stringArray(
  field: string,
  input: string | undefined
): Validated<string[]> {
  return E.tryCatch<InvalidField, string[]>(
    () => {
      const json = input ? JSON.parse(input) : []
      if (Array.isArray(json) && allStrings(json)) return json
      throw new InvalidField(field, 'invalid-array')
    },
    e => new InvalidField(field, 'invalid-array', e)
  )
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

export function stringArrayF<F extends Effect.URIS>(
  M: Effect.MonadThrow<F>,
  field: string
): (_: string | undefined) => Effect.Kind<F, string[]> {
  return (input: string | undefined) =>
    lift<F, string[]>(M)(stringArray(field, input))
}
