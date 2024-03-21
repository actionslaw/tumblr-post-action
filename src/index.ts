import { PostTumblrAction } from './action'
import { GithubActionsLogger } from './logger'
import { GithubActionsRuntime } from './runtime'
import * as Effect from './effect'

const action = new PostTumblrAction<Effect.URI>(
  GithubActionsLogger,
  GithubActionsRuntime
)

Effect.run(action.program)
