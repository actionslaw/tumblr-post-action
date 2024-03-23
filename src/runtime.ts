import * as core from '@actions/core'
import * as Effect from './effect'

export interface Runtime<F extends Effect.URIS> {
  readonly inputs: (key: string) => Effect.Kind<F, string | undefined>
}

export const GithubActionsRuntime: Runtime<Effect.URI> = {
  inputs: (key: string) => Effect.tryCatch(async () => core.getInput(key))
}
