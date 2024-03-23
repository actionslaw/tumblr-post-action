import * as E from 'fp-ts/Either'
import * as HKT from 'fp-ts/lib/HKT'
import * as TE from 'fp-ts/TaskEither'
import * as T from 'fp-ts/Task'
import { MonadThrow2 } from 'fp-ts/lib/MonadThrow'

export type Kind<URI extends HKT.URIS2, A> = HKT.Kind2<URI, Error, A>
export type URIS = HKT.URIS2

export type URI = TE.URI

export function tryCatch<A>(task: T.Task<A>): TE.TaskEither<Error, A> {
  return TE.tryCatch(
    async () => task(),
    e => (e instanceof Error ? e : new Error(`unknown error ${e}`))
  )
}

export const Effect = TE.MonadThrow

export type MonadThrow<F extends URIS> = MonadThrow2<F>

const tap: <F extends URIS, A>(
  MT: MonadThrow<F>,
  f: (_: A) => Kind<F, void>
) => (tapped: Kind<F, A>) => Kind<F, A> = (MT, f) => tapped => {
  return MT.chain(
    MT.chain(tapped, t => f(t)),
    () => tapped
  )
}

export const M = {
  tap
}

// export type Program<F extends URIS> = (MT: MonadThrow<F>) => Kind<F, void>

type ProgramRunner = () => Promise<E.Either<Error, void>>

// export async function runSync(program: ProgramRunner): Promise<void> {
//   E.getOrElse<Error, void>(error => {
//     throw error
//   })(await program(Effect)())
// }

export async function runSync(program: ProgramRunner): Promise<void> {
  E.getOrElse<Error, void>(error => {
    throw error
  })(await program())
}
