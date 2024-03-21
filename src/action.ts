import { Runtime } from './runtime'
import { Logger } from './logger'
import * as Validate from './validate'
// import { Tumblr, TumblrConfig } from './tumblr'
// import { pipe } from 'fp-ts/function'
import * as Effect from './effect'

export class PostTumblrAction<F extends Effect.URIS> {
  private readonly runtime: Runtime<F>
  private readonly logger: Logger<F>

  constructor(logger: Logger<F>, runtime: Runtime<F>) {
    this.logger = logger
    this.runtime = runtime
  }

  program: Effect.Program<F> = (M: Effect.MonadThrow<F>) => {
    // const [consumerKey, consumerSecret, accessToken, accessTokenSecret, text] =
    //   await Validate.checkAll<string>([
    //     Validate.required('consumer-key')(this.runtime.inputs),
    //     Validate.required('consumer-secret')(this.runtime.inputs),
    //     Validate.required('access-token')(this.runtime.inputs),
    //     Validate.required('access-token-secret')(this.runtime.inputs),
    //     Validate.required('text')(this.runtime.inputs)
    //   ])

    // const config: TumblrConfig = {
    //   consumerKey,
    //   consumerSecret,
    //   accessToken,
    //   accessTokenSecret
    // }

    // const tumblr = new Tumblr(config, this.logger)

    // await this.logger.info(`🥃 Sending post [${text}]`)
    // await tumblr.post(text)

    // return M.chain(
    //   this.runtime.inputs('consumer-key'),
    //   Validate.requiredF(M, 'consumer-key')
    // )

    // M.chain

    // const x = this.runtime
    //   .inputs('consumer-key')
    //   .chain(key => Validate.requiredF(M, 'consumer-key', key))

    return M.chain(
      M.chain(
        this.runtime.inputs('consumer-key'),
        Validate.requiredF(M, 'consumer-key')
      ),
      this.logger.info
    )
  }
}
