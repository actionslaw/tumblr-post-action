import { PostTumblrAction } from './action'
import { GitHubActionsLogger } from './logger'
import { GitHubActionsRuntime } from './runtime'
import { TumblrJs } from './tumblr'
import * as Effect from './effect'

const action = new PostTumblrAction<Effect.URI>(
  GitHubActionsLogger,
  GitHubActionsRuntime,
  new TumblrJs()
)

Effect.runSync(action.program)
