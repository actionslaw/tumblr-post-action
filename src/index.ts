import { PostTumblrAction } from './action'
import { GithubActionsLogger } from './logger'
import { GithubActionsRuntime } from './runtime'
import { TumblrJs } from './tumblr'
import * as Effect from './effect'

const action = new PostTumblrAction<Effect.URI>(
  GithubActionsLogger,
  GithubActionsRuntime,
  TumblrJs
)

Effect.runSync(action.program)
