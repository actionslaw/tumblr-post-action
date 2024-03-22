import * as Effect from './effect'

export interface Config {
  consumerKey: string
  consumerSecret: string
  accessToken: string
  accessTokenSecret: string
}

export interface Interface<F extends Effect.URIS> {
  readonly post: (config: Config, text: string) => Effect.Kind<F, void>
}

export class TumblrJs implements Interface<Effect.URI> {
  post(config: Config, text: string): Effect.Kind<Effect.URI, void> {
    return Effect.tryCatch(() => console.log(text, { text }))
  }
}
