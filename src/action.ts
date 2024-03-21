import { Runtime } from './runtime'
import { Logger } from './logger'
// import * as Validate from './validate'
// import { Tumblr, TumblrConfig } from './tumblr'
import { Kind, URIS } from 'fp-ts/lib/HKT'
import { Monad1 } from 'fp-ts/lib/Monad'
// import { flow } from 'fp-ts/function'

export class PostTumblrAction<F extends URIS> {
  private readonly runtime: Runtime<F>
  private readonly logger: Logger<F>

  constructor(logger: Logger<F>, runtime: Runtime<F>) {
    this.logger = logger
    this.runtime = runtime
  }

  run(M: Monad1<F>): Kind<F, void> {
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

    return M.chain(this.runtime.inputs('consumer-key'), this.logger.info)
    // return flow(
    //   this.runtime.inputs('consumer-key'),
    //   this.logger.info
    // )
  }
}
