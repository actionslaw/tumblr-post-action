import * as E from 'fp-ts/Either'
import * as HKT from 'fp-ts/lib/HKT'
import * as IOE from 'fp-ts/IOEither'
import * as I from 'fp-ts/IO'
import { MonadThrow2 } from 'fp-ts/lib/MonadThrow'

export type Kind<URI extends HKT.URIS2, A> = HKT.Kind2<URI, Error, A>
export type URIS = HKT.URIS2

export type URI = IOE.URI

export function tryCatch<A>(io: I.IO<A>): IOE.IOEither<Error, A> {
  return IOE.tryCatch(
    () => io(),
    e => (e instanceof Error ? e : new Error(`unknown error ${e}`))
  )
}

export const Effect = IOE.MonadThrow

export type MonadThrow<F extends URIS> = MonadThrow2<F>

export type Program<F extends URIS> = (M: MonadThrow<F>) => Kind<F, void>

type ProgramRunner = (_: MonadThrow<URI>) => () => E.Either<Error, void>

export function runSync(program: ProgramRunner): void {
  IOE.throwError(program(Effect)())
}
