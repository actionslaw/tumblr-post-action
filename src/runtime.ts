import * as core from '@actions/core'
import * as Effect from './effect'
import * as fs from 'fs'

export interface Runtime<F extends Effect.URIS> {
  readonly inputs: (key: string) => Effect.Kind<F, string | undefined>

  readonly output: (name: string, value: string) => Effect.Kind<F, void>

  readonly fs: (path: string) => Effect.Kind<F, string[]>
}

export const GitHubActionsRuntime: Runtime<Effect.URI> = {
  inputs: (key: string) => Effect.tryCatch(async () => core.getInput(key)),

  output: (name: string, value: string) =>
    Effect.tryCatch(async () => core.setOutput(name, value)),

  fs: (path: string) =>
    Effect.tryCatch(async () => fs.readdirSync(path).map(f => `${path}/${f}`))
}
