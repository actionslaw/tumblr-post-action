import * as core from '@actions/core'
import { Kind, URIS } from 'fp-ts/lib/HKT'
import * as IO from 'fp-ts/IO'

export interface Logger<F extends URIS> {
  info: (_: string | undefined) => Kind<F, void>
}

export const GithubActionsLogger: Logger<IO.URI> = {
  info: (message: string | undefined) => () =>
    message ? core.info(message) : undefined
}
