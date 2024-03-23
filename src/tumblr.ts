import * as Effect from './effect'
import { Post } from './post'
// eslint-disable-next-line @typescript-eslint/no-var-requires,  @typescript-eslint/no-require-imports, import/no-commonjs
const tumblr = require('tumblr.js')

export interface Config {
  consumerKey: string
  consumerSecret: string
  accessToken: string
  accessTokenSecret: string
  blogIdentifier: string
}

export interface Interface<F extends Effect.URIS> {
  readonly post: (config: Config, text: string) => Effect.Kind<F, Post>

  readonly reblog: (
    config: Config,
    text: string,
    replyTo: Post
  ) => Effect.Kind<F, Post>
}

export class TumblrJs implements Interface<Effect.URI> {
  post(config: Config, text: string): Effect.Kind<Effect.URI, Post> {
    const client = tumblr.createClient({
      consumer_key: config.consumerKey,
      consumer_secret: config.consumerSecret,
      token: config.accessToken,
      token_secret: config.accessTokenSecret
    })

    return Effect.tryCatch(async () => {
      const createdPost = await client.createPost(config.blogIdentifier, {
        content: [
          {
            type: 'text',
            text
          }
        ]
      })

      const url = `https://api.tumblr.com/v2/blog/${config.blogIdentifier}/posts/${createdPost.id}`
      const postInfo = await client.getRequest(url)

      const post: Post = {
        id: createdPost.id as string,
        tumblelogId: postInfo.tumblelog_uuid as string,
        reblogKey: postInfo.reblog_key as string
      }

      return post
    })
  }

  reblog(
    config: Config,
    text: string,
    replyTo: Post
  ): Effect.Kind<Effect.URI, Post> {
    const client = tumblr.createClient({
      consumer_key: config.consumerKey,
      consumer_secret: config.consumerSecret,
      token: config.accessToken,
      token_secret: config.accessTokenSecret
    })

    return Effect.tryCatch(async () => {
      const createdPost = await client.createPost(config.blogIdentifier, {
        content: [
          {
            type: 'text',
            text
          }
        ],
        parent_post_id: replyTo.id,
        parent_tumblelog_uuid: replyTo.tumblelogId,
        reblog_key: replyTo.reblogKey
      })

      const url = `https://api.tumblr.com/v2/blog/${config.blogIdentifier}/posts/${createdPost.id}`
      const postInfo = await client.getRequest(url)

      const post: Post = {
        id: createdPost.id as string,
        tumblelogId: postInfo.tumblelog_uuid as string,
        reblogKey: postInfo.reblog_key as string
      }

      return post
    })
  }
}
