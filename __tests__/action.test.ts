import { PostTumblrAction } from '../src/action'
import * as Either from 'fp-ts/Either'
import * as S from 'fp-ts-contrib/lib/StateEither'
import { Logger } from '../src/logger'
import { Runtime } from '../src/runtime'
import { MonadThrow2 } from 'fp-ts/lib/MonadThrow'
import '@relmify/jest-fp-ts'

interface TestState {
  logs: string[]
  inputs: Record<string, string>
}

const initialState: TestState = {
  logs: [],
  inputs: {
    'consumer-key': 'consumer-key-value'
  }
}

const URI = 'TestEffect'

// eslint-disable-next-line no-redeclare
type URI = typeof URI

declare module 'fp-ts/HKT' {
  interface URItoKind2<E, A> {
    readonly TestEffect: TestEffect<E, A>
  }
}

type TestEffect<E, A> = S.StateEither<TestState, E, A>

const MonadThrow: MonadThrow2<URI> = {
  URI,
  map: S.MonadThrow.map,
  ap: S.MonadThrow.ap,
  of: S.MonadThrow.of,
  chain: S.MonadThrow.chain,
  throwError: S.MonadThrow.throwError
}

const log = (message: string | undefined, s: TestState): TestState => {
  return { logs: [...s.logs, message] } as TestState
}

const TestLogger: Logger<URI> = {
  info: (message: string | undefined) =>
    S.modify<TestState>(s => log(message, s))
}

const TestRuntime: Runtime<URI> = {
  inputs: (key: string) =>
    S.gets<TestState, Error, string | undefined>(s => s.inputs[key])
}

type TestProgram = TestEffect<Error, void>

function run(program: TestProgram): Either.Either<Error, TestState> {
  const maybeRun = program(initialState)
  const state = Either.map<[void, TestState], TestState>(r => {
    const [, s] = r
    return s
  })(maybeRun)
  return state
}

function optics<A>(
  state: Either.Either<Error, TestState>,
  get: (s: TestState) => A
): Either.Either<Error, A> {
  return Either.map(get)(state)
}

describe('PostTumblrAction', () => {
  const action = new PostTumblrAction<URI>(TestLogger, TestRuntime)

  it('logs', () => {
    const state = run(action.program(MonadThrow))
    expect(optics(state, s => s.logs)).toEqualRight(['consumer-key-value'])
  })
})
