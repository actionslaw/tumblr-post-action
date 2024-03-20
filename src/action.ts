import { Runtime, GithubActionsRuntime } from './runtime'
import { Logger, GithubActionsLogger } from './logger'
import * as Validate from './validate'
import { Tumblr, TumblrConfig } from './tumblr'

export class PostTumblrAction {
  private readonly runtime: Runtime
  private readonly logger: Logger

  constructor(
    runtime: Runtime = GithubActionsRuntime,
    logger: Logger = GithubActionsLogger
  ) {
    this.runtime = runtime
    this.logger = logger
  }

  async run(): Promise<void> {
    const [consumerKey, consumerSecret, accessToken, accessTokenSecret, text] =
      await Validate.checkAll<string>([
        Validate.required('consumer-key')(this.runtime.inputs),
        Validate.required('consumer-secret')(this.runtime.inputs),
        Validate.required('access-token')(this.runtime.inputs),
        Validate.required('access-token-secret')(this.runtime.inputs),
        Validate.required('text')(this.runtime.inputs)
      ])

    const config: TumblrConfig = {
      consumerKey,
      consumerSecret,
      accessToken,
      accessTokenSecret
    }

    const tumblr = new Tumblr(config, this.logger)

    await this.logger.info(`🥃 Sending post [${text}]`)
    await tumblr.post(text)

    console.log(tumblr)
  }
}
