import * as core from '@actions/core'
import * as Effect from './effect'

export interface Logger<F extends Effect.URIS> {
  info: (_: string) => Effect.Kind<F, void>
}

export const GithubActionsLogger: Logger<Effect.URI> = {
  info: (message: string) => Effect.tryCatch(() => core.info(message))
}
