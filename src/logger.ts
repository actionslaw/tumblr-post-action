import * as core from '@actions/core'

export interface Logger {
  info: (_: string) => Promise<void>
  debug: (_: string) => Promise<void>
}

export const GithubActionsLogger = new (class implements Logger {
  info = (message: string) => Promise.resolve(core.info(message))

  debug = (message: string) => Promise.resolve(core.debug(message))
})()
