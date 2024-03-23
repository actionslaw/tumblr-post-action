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
  logs: [string, string][]
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

const TestLogger: Logger<URI> = {
  info: (_: string, data: Record<string, string>) =>
    S.modify<TestState>(s => {
      const update = { logs: [...s.logs, ...Object.entries(data)] }
      return Object.assign(s, update)
    })
}

const TestRuntime: Runtime<URI> = {
  inputs: (key: string) => S.gets(s => s.inputs[key])
}

const TestTumblr: Tumblr.Interface<URI> = {
  post: (config: Tumblr.Config, text: string) => {
    return S.modify<TestState>(s => {
      const update = { posts: [...s.posts, text], config: O.some(config) }
      return Object.assign(s, update)
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

const config = {
  'consumer-key': 'test-consumer-key',
  'consumer-secret': 'test-consumer-secret',
  'access-token': 'test-access-token',
  'access-token-secret': 'test-access-token-secret',
  'blog-identifier': 'test-blog-identifier'
}

describe('PostTumblrAction', () => {
  const action = new PostTumblrAction<URI>(TestLogger, TestRuntime, TestTumblr)

  it('post to tumblr', () => {
    const inputs = { text: 'test-post', ...config }
    const state = run(action.program(MonadThrow), inputs)
    expect(optics(state, s => s.posts)).toEqualRight(['test-post'])
  })

  it('log post text', () => {
    const inputs = { text: 'test-post', ...config }
    const state = run(action.program(MonadThrow), inputs)
    expect(optics(state, s => s.logs)).toEqualRight([['text', 'test-post']])
  })

  it('configure tumblr.js correctly', () => {
    const inputs = { text: 'test-post', ...config }
    const state = run(action.program(MonadThrow), inputs)
    expect(optics(state, s => s.config)).toEqualRight(
      O.some({
        consumerKey: 'test-consumer-key',
        consumerSecret: 'test-consumer-secret',
        accessToken: 'test-access-token',
        accessTokenSecret: 'test-access-token-secret',
        blogIdentifier: 'test-blog-identifier'
      } as Tumblr.Config)
    )
  })
})
