import { PostTumblrAction } from './action'

// import { TumblrConfig } from './TumblrConfig'
// import { PostTumblrAction } from './PostTumblrAction'
// import * as core from '@actions/core'

// const validateRequiredInput = (key: string) => Validate.required(key)(core.getInput(key))
// const validateRequiredSecret = (key: string) => {
//   const input = yield Validate.required(key)(core.getInput(key))
//   core.setSecret(input)
//   return input
// }

// try {
//   const consumerKey = yield validateRequiredSecret('consumer-key')
//   const consumerSecret = yield * validateRequiredSecret('consumer-secret')
//   const accessToken = yield * validateRequiredSecret('access-token')
//   const accessTokenSecret = yield * validateRequiredSecret('access-token-secret')

//   const config: TumblrConfig = {
//     consumerKey: consumerKey,
//     consumerSecret: consumerSecret,
//     accessToken: accessToken,
//     accessTokenSecret: accessTokenSecret
//   }

//   const action = new PostTumblrAction(config);

//   const text = yield * validateRequiredInput("text");
//   const media = core.getInput("media");
//   const replyTo = core.getInput("replyTo");

//   if (!text) {
//     core.setFailed("Missing text input is required")
//   } else {
//     core.info(`🥃 Sending post [${text}]`)

//
//     action.post(text);
//   }
// } catch (error) {
//   if (error instanceof Error) core.setFailed(error.message)
// }

// const program = Console.log('Hello, World!').pipe(Console.error("Whoops").pipe)

// eslint-disable-next-line @typescript-eslint/no-floating-promises
// Effect.runSync(PostTumblrAction.program)
