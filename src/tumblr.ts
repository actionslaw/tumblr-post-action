import { Logger } from './logger'

export interface TumblrConfig {
  consumerKey: string
  consumerSecret: string
  accessToken: string
  accessTokenSecret: string
}

export class Tumblr {
  private readonly config: TumblrConfig
  private readonly logger: Logger

  constructor(config: TumblrConfig, logger: Logger) {
    this.config = config
    this.logger = logger
  }

  async post(text: string): Promise<void> {
    await this.logger.info(text)
  }
}
