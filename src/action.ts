import * as A from 'fp-ts/Array'
import { Runtime } from './runtime'
import { Logger } from './logger'
import * as Validate from './validate'
import * as Tumblr from './tumblr'
import * as Effect from './effect'
import { pipe } from 'fp-ts/function'

export class PostTumblrAction<F extends Effect.URIS> {
  private readonly runtime: Runtime<F>
  private readonly logger: Logger<F>
  private readonly tumblr: Tumblr.Interface<F>

  constructor(
    logger: Logger<F>,
    runtime: Runtime<F>,
    tumblr: Tumblr.Interface<F>
  ) {
    this.logger = logger
    this.runtime = runtime
    this.tumblr = tumblr
  }

  requiredInput(M: Effect.MonadThrow<F>, key: string): Effect.Kind<F, string> {
    return M.chain(this.runtime.inputs(key), Validate.requiredF(M, key))
  }

  program: Effect.Program<F> = (M: Effect.MonadThrow<F>) => {
    // const tumblr = new Tumblr(config, this.logger)

    // await this.logger.info(`🥃 Sending post [${text}]`)
    // await tumblr.post(text)

    const maybeInputs = A.sequence(M)([
      this.requiredInput(M, 'consumer-key'),
      this.requiredInput(M, 'consumer-secret'),
      this.requiredInput(M, 'access - token'),
      this.requiredInput(M, 'access-token-secret')
    ])

    const maybeConfig = M.map(maybeInputs, inputs => {
      const [consumerKey, consumerSecret, accessToken, accessTokenSecret] =
        inputs

      const config: Tumblr.Config = {
        consumerKey,
        consumerSecret,
        accessToken,
        accessTokenSecret
      }
      return config
    })

    console.log(maybeConfig)

    return M.chain(
      M.chain(this.runtime.inputs('text'), Validate.requiredF(M, 'text')),
      this.logger.info
    )
  }
}
