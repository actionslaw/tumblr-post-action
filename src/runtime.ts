import * as core from '@actions/core'
import * as Effect from './effect'

export interface Runtime<F extends Effect.URIS> {
  readonly inputs: (key: string) => Effect.Kind<F, string | undefined>

  readonly output: (name: string, value: string) => Effect.Kind<F, void>
}

export const GitHubActionsRuntime: Runtime<Effect.URI> = {
  inputs: (key: string) => Effect.tryCatch(async () => core.getInput(key)),

  output: (name: string, value: string) =>
    Effect.tryCatch(async () => core.setOutput(name, value))
}
