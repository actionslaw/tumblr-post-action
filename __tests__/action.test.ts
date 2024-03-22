import { PostTumblrAction } from '../src/action'
import * as Either from 'fp-ts/Either'
import * as S from 'fp-ts-contrib/lib/StateEither'
import { Logger } from '../src/logger'
import { Runtime } from '../src/runtime'
import { MonadThrow2 } from 'fp-ts/lib/MonadThrow'
import * as O from 'fp-ts/Option'
import * as Tumblr from '../src/tumblr'

import '@relmify/jest-fp-ts'

interface TestState {
  inputs: Record<string, string>
  logs: string[]
  config: O.Option<Tumblr.Config>
  posts: string[]
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
  info: (message: string) => S.modify<TestState>(s => log(message, s))
}

const TestRuntime: Runtime<URI> = {
  inputs: (key: string) => S.gets(s => s.inputs[key])
}

const TestTumblr: Tumblr.Interface<URI> = {
  post: (config: Tumblr.Config, text: string) => {
    return S.modify<TestState>(s => {
      const update = { posts: [...s.posts, text], config: O.some(config) }
      return Object.assign(update, s)
    })
  }
}

type TestProgram = TestEffect<Error, void>

function run(
  program: TestProgram,
  inputs?: Record<string, string>
): Either.Either<Error, TestState> {
  const initialState: TestState = {
    inputs: inputs ? inputs : {},
    logs: [],
    config: O.none,
    posts: []
  }

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
  const action = new PostTumblrAction<URI>(TestLogger, TestRuntime, TestTumblr)

  it('post to tumblr', () => {
    const state = run(action.program(MonadThrow), { text: 'test-post' })
    expect(optics(state, s => s.posts)).toEqualRight(['test-post'])
  })
})
