import * as core from '@actions/core'
import * as Effect from './effect'

export interface Logger<F extends Effect.URIS> {
  info: (message: string, data: Record<string, string>) => Effect.Kind<F, void>
  debug: (message: string) => Effect.Kind<F, void>
}

export const GitHubActionsLogger: Logger<Effect.URI> = {
  info: (message: string, data: Record<string, string>) => {
    const segments = Object.entries(data).map(
      ([key, value]) => `${key}=[${value}]`
    )

    return Effect.tryCatch(async () =>
      core.info([message, ...segments].join(' '))
    )
  },

  debug: (message: string) => {
    return Effect.tryCatch(async () => core.debug(message))
  }
}
