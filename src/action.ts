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

  program: Effect.Program<F> = (M: Effect.MonadThrow<F>) =>
    pipe(
      A.sequence(M)([
        this.requiredInput(M, 'consumer-key'),
        this.requiredInput(M, 'consumer-secret'),
        this.requiredInput(M, 'access-token'),
        this.requiredInput(M, 'access-token-secret'),
        this.requiredInput(M, 'blog-identifier'),
        this.requiredInput(M, 'text')
      ]),
      maybeInputs =>
        M.chain(
          M.chain(
            M.map(maybeInputs, inputs => {
              const [
                consumerKey,
                consumerSecret,
                accessToken,
                accessTokenSecret,
                blogIdentifier,
                text
              ] = inputs

              const config = {
                consumerKey,
                consumerSecret,
                accessToken,
                accessTokenSecret,
                blogIdentifier
              } as Tumblr.Config

              return [config, text] as [Tumblr.Config, string]
            }),
            Effect.M.tap(M, ([, text]) =>
              this.logger.info('🥃 sending tumblr post', { text })
            )
          ),
          ([config, text]) => this.tumblr.post(config, text)
        )
    )
}
