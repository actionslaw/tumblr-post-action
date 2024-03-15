import { TumblrConfig } from "./TumblrConfig";

export class PostTumblrAction {
  private config: TumblrConfig

  constructor(config: TumblrConfig) {
    this.config = config;
  }

  async post(text: string): Promise<void> {
  }
}
