// import { PostTumblrAction } from '../src/action'
// import { StateRuntime, State } from '../src/state'
// import { Logger } from '../src/logger'

// interface TestState extends State {
//   readonly logs: string[]
// }

// const startingState: TestState = {
//   ins: {
//     'consumer- key': '???'
//   },
//   logs: []
// }

// const stubLogger = new class implements Logger {

//   info: (_: string) => Promise<void> = (message: string) => {
//     return StateRuntime.update<TestState, void>(state => [Object.assign({ logs: state.logs.concat[message] }, state), undefined])
//   }

//   debug: (_: string) => Promise<void>

// }

// describe('PostTumblrAction', () => {
//   it('required validator', async () => {
//     const endState = await StateRuntime.start(startingState)(async (runtime) => {
//       const action = new PostTumblrAction(runtime, stubLogger)
//       return action.run()
//     })

//     expect(endState.logs).toContain('Sending post [test-1]')
//   })
// })
