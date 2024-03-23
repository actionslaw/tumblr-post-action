import * as A from 'fp-ts/Array'
import { Runtime } from './runtime'
import { Logger } from './logger'
import * as Validate from './validate'
import * as Tumblr from './tumblr'
import * as Effect from './effect'
import { Post, postDecoder } from './post'
import { pipe } from 'fp-ts/function'

interface TextPost {
  kind: 'text'
  text: string
}

interface Reblog {
  kind: 'reblog'
  text: string
  replyTo: string
}

type PostType = TextPost | Reblog

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

  replyPost(M: Effect.MonadThrow<F>): Effect.Kind<F, Post> {
    return M.chain(this.runtime.inputs('replyTo'), id => postDecoder(M, id))
  }

  post(
    M: Effect.MonadThrow<F>,
    config: Tumblr.Config,
    post: TextPost
  ): Effect.Kind<F, Post> {
    return M.chain(
      this.logger.info('🥃 sending tumblr post', { text: post.text }),
      () => this.tumblr.post(config, post.text)
    )
  }

  reblog(
    M: Effect.MonadThrow<F>,
    config: Tumblr.Config,
    reblog: Reblog
  ): Effect.Kind<F, Post> {
    return M.chain(
      this.logger.info('🥃 reblogging tumblr post', {
        text: reblog.text,
        'reply-id': reblog.replyTo
      }),
      () =>
        M.chain(this.replyPost(M), reply =>
          this.tumblr.reblog(config, reblog.text, reply)
        )
    )
  }

  program: Effect.Program<F> = (M: Effect.MonadThrow<F>) =>
    pipe(
      A.sequence(M)([
        this.requiredInput(M, 'consumer-key'),
        this.requiredInput(M, 'consumer-secret'),
        this.requiredInput(M, 'access-token'),
        this.requiredInput(M, 'access-token-secret'),
        this.requiredInput(M, 'blog-identifier'),
        this.requiredInput(M, 'text'),
        this.runtime.inputs('replyTo')
      ]),
      maybeInputs =>
        M.chain(
          M.chain<Error, [Tumblr.Config, PostType], Post>(
            M.map(maybeInputs, inputs => {
              const [
                consumerKey,
                consumerSecret,
                accessToken,
                accessTokenSecret,
                blogIdentifier,
                text,
                replyTo
              ] = inputs

              const config = {
                consumerKey,
                consumerSecret,
                accessToken,
                accessTokenSecret,
                blogIdentifier
              } as Tumblr.Config

              const post: PostType = replyTo
                ? ({ kind: 'reblog', text, replyTo } as Reblog)
                : ({ kind: 'text', text } as TextPost)

              return [config, post] as [Tumblr.Config, PostType]
            }),
            ([config, post]) => {
              switch (post.kind) {
                case 'text':
                  return this.post(M, config, post)

                case 'reblog':
                  return this.reblog(M, config, post)

                default:
                  return M.throwError(
                    new Error('could not determine post type')
                  )
              }
            }
          ),
          (post: Post) => {
            const postId = `${post.id}|${post.tumblelogId}|${post.reblogKey}`
            return this.runtime.output('post-id', postId)
          }
        )
    )
}
