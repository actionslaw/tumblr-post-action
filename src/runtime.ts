import * as core from '@actions/core'

export interface Runtime {
  readonly inputs: (key: string) => Promise<string | undefined>
}

export const GithubActionsRuntime = new (class implements Runtime {
  inputs = async (key: string): Promise<string | undefined> =>
    Promise.resolve(core.getInput(key))
})()
