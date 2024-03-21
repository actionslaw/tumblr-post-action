import { PostTumblrAction } from '../src/action'
import * as S from 'fp-ts/lib/State'
import { Logger } from '../src/logger'
import { Runtime } from '../src/runtime'
import { Monad1 } from 'fp-ts/lib/Monad'

interface TestState {
  log: string[]
  inputs: Record<string, string>
}

const initialState: TestState = {
  log: [],
  inputs: {
    'consumer-key': 'consumer-key-value'
  }
}

const URI = 'TestEffect'

// eslint-disable-next-line no-redeclare
type URI = typeof URI

declare module 'fp-ts/HKT' {
  interface URItoKind<A> {
    readonly TestEffect: TestEffect<A>
  }
}

interface TestEffect<A> extends S.State<TestState, A> { }

const TestEffectMonad: Monad1<URI> = {
  URI,
  map: S.Monad.map,
  ap: S.Monad.ap,
  of: S.Monad.of,
  chain: S.Monad.chain
}

const log = (message: string | undefined, s: TestState): TestState => {
  return { log: [...s.log, message] } as TestState
}

const TestLogger: Logger<URI> = {
  info: (message: string | undefined) =>
    S.modify<TestState>(s => log(message, s))
}

const TestRuntime: Runtime<URI> = {
  inputs: (key: string) =>
    S.gets<TestState, string | undefined>(s => s.inputs[key])
}

describe('PostTumblrAction', () => {
  const action = new PostTumblrAction<URI>(TestLogger, TestRuntime)

  it('logs', () => {
    const [, state] = action.run(TestEffectMonad)(initialState)
    expect(state.log).toContain('consumer-key-value')
  })
})
