import { PostTumblrAction } from './PostTumblrAction'
import * as core from '@actions/core'

const action = new PostTumblrAction();

try {
  const text = core.getInput("text");
  const media = core.getInput("media");
  const replyTo = core.getInput("replyTo");

  if (!text) {
    core.setFailed("Missing text input is required")
  } else {
    core.info(`🥃 Sending post [${text}]`)

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    action.post(text);
  }
} catch (error) {
  if (error instanceof Error) core.setFailed(error.message)
}
