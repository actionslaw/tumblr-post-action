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

export const TumblrJs: Interface<Effect.URI> = {
  post: (config: Config, text: string) =>
    Effect.tryCatch(() => console.log(text))
}
