import * as core from '@actions/core'

export interface Runtime {
  readonly inputs: (key: string) => Promise<string | undefined>
}

export const GithubActionsRuntime = new (class implements Runtime {
  inputs = (key: string) => Promise.resolve(core.getInput(key))
})()
