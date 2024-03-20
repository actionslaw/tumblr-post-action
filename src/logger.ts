import * as core from '@actions/core'

export interface Logger {
  info: (_: string) => Promise<void>
  debug: (_: string) => Promise<void>
}

export const GithubActionsLogger = new (class implements Logger {
  info = async (message: string): Promise<void> =>
    Promise.resolve(core.info(message))

  debug = async (message: string): Promise<void> =>
    Promise.resolve(core.debug(message))
})()
