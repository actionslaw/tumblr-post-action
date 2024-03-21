import * as core from '@actions/core'
import { Kind, URIS } from 'fp-ts/lib/HKT'
import * as IO from 'fp-ts/IO'

export interface Runtime<F extends URIS> {
  readonly inputs: (key: string) => Kind<F, string | undefined>
}

export const GithubActionsRuntime: Runtime<IO.URI> = {
  inputs: (key: string) => () => core.getInput(key)
}
