export interface TumblrConfig {
  consumerKey: string
  consumerSecret: string
  accessToken: string
  accessTokenSecret: string
}

export class Tumblr {
  private readonly config: TumblrConfig

  constructor(config: TumblrConfig) {
    this.config = config
  }

  async post(text: string): Promise<void> {}
}
