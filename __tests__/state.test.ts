import { StateRuntime, State } from '../src/state'

describe('StateRuntime', () => {

  interface TestState extends State {
    readonly count: number
  }

  const startingState: TestState = {
    ins: {},
    count: 0
  }

  it('updates state', async () => {
    const endState = await StateRuntime.start(startingState)(() => {
      return StateRuntime.update<TestState>((s) => Object.assign(s, { count: s.count + 1 }))
    })

    expect(endState(startingState).count).toBe(1)
  })
})
