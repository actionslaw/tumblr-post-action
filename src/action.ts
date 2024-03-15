import { Console, Effect } from 'effect'
import { Validate } from './validate'
import * as core from '@actions/core'

interface TumblrConfig {
  consumerKey: string
  consumerSecret: string
  accessToken: string
  accessTokenSecret: string
}

export class PostTumblrAction {
  private config: TumblrConfig

  constructor(config: TumblrConfig) {
    this.config = config
  }

  post(text: string): Effect.Effect<void> {
    return Console.log(text)
  }

  static program = Effect.gen(function* (_) {
    const consumerKey = yield* _(Validate.required<string>('consumer-key')(core.getInput))
    const consumerSecret = yield* _(Validate.required<string>('consumer-secret')(core.getInput))
    const accessToken = yield* _(Validate.required<string>('access-token')(core.getInput))
    const accessTokenSecret = yield* _(Validate.required<string>('access-token-secret')(core.getInput))

    const config: TumblrConfig = {
      consumerKey,
      consumerSecret,
      accessToken,
      accessTokenSecret
    }

    const action = new PostTumblrAction(config)

    const text = yield* _(Validate.required<string>('text')(core.getInput))

    core.info(`🥃 Sending post [${text}]`)
    return action.post(text)
  })

}
