import { PostTumblrAction } from './action'
import { GithubActionsLogger } from './logger'
import { GithubActionsRuntime } from './runtime'
import * as IO from 'fp-ts/IO'

const action = new PostTumblrAction<IO.URI>(
  GithubActionsLogger,
  GithubActionsRuntime
)

action.run(IO.Monad)()
