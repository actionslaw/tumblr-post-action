import * as Effect from './effect'
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
  readonly post: (config: Config, text: string) => Effect.Kind<F, void>
}

export class TumblrJs implements Interface<Effect.URI> {
  post(config: Config, text: string): Effect.Kind<Effect.URI, void> {
    const client = tumblr.createClient({
      consumer_key: config.consumerKey,
      consumer_secret: config.consumerSecret,
      token: config.accessToken,
      token_secret: config.accessTokenSecret
    })

    return Effect.tryCatch(
      async () =>
        await client.createPost(config.blogIdentifier, {
          content: [
            {
              type: 'text',
              text
            }
          ]
        })
    )
  }
}
