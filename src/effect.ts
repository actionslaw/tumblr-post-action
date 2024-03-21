import * as E from 'fp-ts/Either'
import { Kind2, URIS2 } from 'fp-ts/lib/HKT'
import * as IOEither from 'fp-ts/IOEither'
import * as I from 'fp-ts/IO'
import { MonadThrow2 } from 'fp-ts/lib/MonadThrow'

export type Kind<URI extends URIS2, A> = Kind2<URI, Error, A>
export type URIS = URIS2

export type URI = IOEither.URI

export function tryCatch<A>(io: I.IO<A>): IOEither.IOEither<Error, A> {
  return () =>
    E.tryCatch(
      () => io(),
      e => (e instanceof Error ? e : new Error(`unknown error ${e}`))
    )
}

export type MonadThrow<F extends URIS> = MonadThrow2<F>

export const Effect = IOEither.MonadThrow

export type Program<F extends URIS> = (M: MonadThrow<F>) => Kind<F, void>

type ProgramRunner = (_: MonadThrow<URI>) => () => E.Either<Error, void>

export function run(program: ProgramRunner): void {
  E.throwError(program(Effect)())
}
