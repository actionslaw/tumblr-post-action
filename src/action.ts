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
  tags: string[]
}

interface Reblog {
  kind: 'reblog'
  text: string
  replyTo: string
  tags: string[]
}

type PostType = TextPost | Reblog

export class PostTumblrAction<F extends Effect.URIS> {
  private readonly M: Effect.MonadThrow<F>
  private readonly runtime: Runtime<F>
  private readonly logger: Logger<F>
  private readonly tumblr: Tumblr.Interface<F>

  constructor(
    M: Effect.MonadThrow<F>,
    logger: Logger<F>,
    runtime: Runtime<F>,
    tumblr: Tumblr.Interface<F>
  ) {
    this.M = M
    this.logger = logger
    this.runtime = runtime
    this.tumblr = tumblr
  }

  requiredInput(key: string): Effect.Kind<F, string> {
    return this.M.chain(
      this.runtime.inputs(key),
      Validate.requiredF(this.M, key)
    )
  }

  replyPost(): Effect.Kind<F, Post> {
    return this.M.chain(this.runtime.inputs('replyTo'), id =>
      postDecoder(this.M, id)
    )
  }

  post(config: Tumblr.Config, post: TextPost): Effect.Kind<F, Post> {
    return this.M.chain(
      this.logger.info('🥃 sending tumblr post', { text: post.text }),
      () =>
        this.M.chain(this.media(), media =>
          this.tumblr.post(config, post.text, media, post.tags)
        )
    )
  }

  reblog(config: Tumblr.Config, reblog: Reblog): Effect.Kind<F, Post> {
    return this.M.chain(
      this.logger.info('🥃 reblogging tumblr post', {
        text: reblog.text,
        'reply-id': reblog.replyTo
      }),
      () =>
        this.M.chain(this.media(), media =>
          this.M.chain(this.replyPost(), reply =>
            this.tumblr.reblog(config, reblog.text, reply, media, reblog.tags)
          )
        )
    )
  }

  media(): Effect.Kind<F, string[]> {
    const logMediaPath = Effect.M.tap<F, string | undefined>(this.M, media =>
      media
        ? this.logger.info('reading files from media folder', { path: media })
        : this.logger.debug('no media found')
    )

    const logMedia = Effect.M.tap<F, string[]>(this.M, media =>
      this.logger.info('reading files from media folder', {
        files: media.join(',')
      })
    )
    return this.M.chain(logMediaPath(this.runtime.inputs('media')), media =>
      media ? logMedia(this.runtime.fs(media)) : this.M.of([])
    )
  }

  config(): Effect.Kind<F, Tumblr.Config> {
    return pipe(
      A.sequence(this.M)([
        this.requiredInput('consumer-key'),
        this.requiredInput('consumer-secret'),
        this.requiredInput('access-token'),
        this.requiredInput('access-token-secret'),
        this.requiredInput('blog-identifier')
      ]),
      maybeConfigs =>
        this.M.map(maybeConfigs, configs => {
          const [
            consumerKey,
            consumerSecret,
            accessToken,
            accessTokenSecret,
            blogIdentifier
          ] = configs

          const config: Tumblr.Config = {
            consumerKey,
            consumerSecret,
            accessToken,
            accessTokenSecret,
            blogIdentifier
          }

          return config
        })
    )
  }

  tags(): Effect.Kind<F, string[]> {
    const logTags = Effect.M.tap<F, string[]>(this.M, tags => {
      if (tags.length > 0) {
        return this.logger.info('posting with tags', {
          tags: tags.join(',')
        })
      } else return this.M.of(undefined)
    })

    return logTags(
      this.M.chain(
        this.runtime.inputs('tags'),
        Validate.stringArrayF(this.M, 'tags')
      )
    )
  }

  send(post: PostType): Effect.Kind<F, Post> {
    return this.M.chain(this.config(), config => {
      switch (post.kind) {
        case 'text':
          return this.post(config, post)

        case 'reblog':
          return this.reblog(config, post)

        default:
          return this.M.throwError(new Error('could not determine post type'))
      }
    })
  }

  program(): Effect.Kind<F, void> {
    return this.M.chain(
      this.M.chain(this.requiredInput('text'), text => {
        return this.M.chain(this.tags(), tags => {
          return this.M.chain(this.runtime.inputs('replyTo'), maybeReplyTo => {
            const post: PostType = maybeReplyTo
              ? { kind: 'reblog', text, replyTo: maybeReplyTo, tags }
              : { kind: 'text', text, tags }
            return this.send(post)
          })
        })
      }),
      (post: Post) => {
        const postId = `${post.id}|${post.tumblelogId}|${post.reblogKey}`
        return this.runtime.output('post-id', postId)
      }
    )
  }
}
