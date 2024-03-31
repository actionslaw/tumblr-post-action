import { PostTumblrAction } from '../src/action'
import * as Either from 'fp-ts/Either'
import * as S from 'fp-ts-contrib/lib/StateEither'
import { Logger } from '../src/logger'
import { Runtime } from '../src/runtime'
import { MonadThrow2 } from 'fp-ts/lib/MonadThrow'
import * as O from 'fp-ts/Option'
import { Post } from '../src/post'
import * as Tumblr from '../src/tumblr'

import '@relmify/jest-fp-ts'

interface TestState {
  inputs: Record<string, string>
  outputs: [string, string][]
  logs: [string, string][]
  config: O.Option<Tumblr.Config>
  posts: string[]
  postedMedia: string[]
  reblogs: [string, Post][]
  tags: string[]
  sampleTextPost: Post
  media: Record<string, string[]>
  postedTags: [string, Post][]
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
    }),

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  debug: (_: string) => S.right(undefined)
}

const TestRuntime: Runtime<URI> = {
  inputs: (key: string) => S.gets(s => s.inputs[key]),

  output: (name: string, value: string) => {
    return S.modify(s => {
      const update = { outputs: [...s.outputs, [name, value]] }
      return Object.assign(s, update)
    })
  },

  fs: (path: string) => S.gets(s => s.media[path])
}

const TestTumblr: Tumblr.Interface<URI> = {
  post: (
    config: Tumblr.Config,
    text: string,
    media: string[],
    tags: string[]
  ) => {
    return S.chain(() =>
      S.gets<TestState, Error, Post>(s => {
        const post: Post = s.sampleTextPost
        return post
      })
    )(
      S.modify<TestState>(s => {
        const update = {
          posts: [...s.posts, text],
          postedMedia: media,
          postedTags: tags,
          config: O.some(config)
        }
        return Object.assign(s, update)
      })
    )
  },

  reblog: (
    config: Tumblr.Config,
    text: string,
    replyTo: Post,
    media: string[],
    tags: string[]
  ) => {
    return S.chain(() =>
      S.gets<TestState, Error, Post>(s => {
        const post: Post = s.sampleTextPost
        return post
      })
    )(
      S.modify<TestState>(s => {
        const update = {
          reblogs: [...s.reblogs, [text, replyTo]],
          postedMedia: media,
          postedTags: tags,
          config: O.some(config)
        }
        return Object.assign(s, update)
      })
    )
  }
}

type TestProgram = TestEffect<Error, void>

function run(
  program: TestProgram,
  inputs?: Record<string, string>
): Either.Either<Error, TestState> {
  const initialState: TestState = {
    inputs: inputs ? inputs : {},
    outputs: [],
    logs: [],
    config: O.none,
    posts: [],
    postedMedia: [],
    reblogs: [],
    tags: [],
    sampleTextPost: {
      id: 'test-post-id',
      tumblelogId: 'test-tumblelog-uuid',
      reblogKey: 'test-reblog-key'
    },
    media: { path: ['file-1', 'file-2'] },
    postedTags: []
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
  const action = new PostTumblrAction<URI>(
    MonadThrow,
    TestLogger,
    TestRuntime,
    TestTumblr
  )

  it('configure tumblr.js correctly', () => {
    const inputs = { text: 'test-post', ...config }
    const state = run(action.program(), inputs)
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

  it('post to tumblr', () => {
    const inputs = { text: 'test-post', ...config }
    const state = run(action.program(), inputs)
    expect(optics(state, s => s.posts)).toEqualRight(['test-post'])
  })

  it('log post text', () => {
    const inputs = { text: 'test-post', ...config }
    const state = run(action.program(), inputs)
    expect(optics(state, s => s.logs)).toEqualRight([['text', 'test-post']])
  })

  it('output post id', () => {
    const inputs = { text: 'test-post', ...config }

    const state = run(action.program(), inputs)

    expect(optics(state, s => s.outputs)).toEqualRight([
      ['post-id', 'test-post-id|test-tumblelog-uuid|test-reblog-key']
    ])
  })

  it('post to tumblr with media', () => {
    const inputs = { text: 'test-post', media: 'path', ...config }
    const state = run(action.program(), inputs)
    expect(optics(state, s => s.postedMedia)).toEqualRight(['file-1', 'file-2'])
  })

  it('log posted media', () => {
    const inputs = { text: 'test-post', media: 'path', ...config }

    const state = run(action.program(), inputs)

    expect(optics(state, s => s.logs)).toEqualRight([
      ['text', 'test-post'],
      ['path', 'path'],
      ['files', 'file-1,file-2']
    ])
  })

  it('post to tumblr with tags', () => {
    const inputs = {
      text: 'test-post',
      tags: '["#tag1", "#tag2"]',
      ...config
    }

    const state = run(action.program(), inputs)

    expect(optics(state, s => s.postedTags)).toEqualRight(['#tag1', '#tag2'])
  })

  it('log posted tags', () => {
    const inputs = {
      text: 'test-reblog',
      tags: '["#tag1", "#tag2"]',
      ...config
    }

    const state = run(action.program(), inputs)

    expect(optics(state, s => s.logs)).toEqualRight([
      ['tags', '#tag1,#tag2'],
      ['text', 'test-reblog']
    ])
  })

  it('reblog tumblr post', () => {
    const replyId = 'test-reply-id|test-tumblelog-uuid|test-reblog-key'
    const expectedReply: Post = {
      id: 'test-reply-id',
      tumblelogId: 'test-tumblelog-uuid',
      reblogKey: 'test-reblog-key'
    }
    const inputs = { text: 'test-reblog', replyTo: replyId, ...config }

    const state = run(action.program(), inputs)

    expect(optics(state, s => s.reblogs)).toEqualRight([
      ['test-reblog', expectedReply]
    ])
  })

  it('log reblog', () => {
    const replyId = 'test-post-id|test-tumblelog-uuid|test-reblog-key'
    const inputs = { text: 'test-reblog', replyTo: replyId, ...config }

    const state = run(action.program(), inputs)

    expect(optics(state, s => s.logs)).toEqualRight([
      ['text', 'test-reblog'],
      ['reply-id', replyId]
    ])
  })

  it('output reblog post id', () => {
    const inputs = { text: 'test-post', ...config }

    const state = run(action.program(), inputs)

    expect(optics(state, s => s.outputs)).toEqualRight([
      ['post-id', 'test-post-id|test-tumblelog-uuid|test-reblog-key']
    ])
  })

  it('reblog to tumblr with media', () => {
    const replyId = 'test-reply-id|test-tumblelog-uuid|test-reblog-key'
    const inputs = {
      text: 'test-post',
      replyTo: replyId,
      media: 'path',
      ...config
    }

    const state = run(action.program(), inputs)

    expect(optics(state, s => s.postedMedia)).toEqualRight(['file-1', 'file-2'])
  })

  it('log reblogged media', () => {
    const replyId = 'test-reply-id|test-tumblelog-uuid|test-reblog-key'
    const inputs = {
      text: 'test-reblog',
      replyTo: replyId,
      media: 'path',
      ...config
    }

    const state = run(action.program(), inputs)

    expect(optics(state, s => s.logs)).toEqualRight([
      ['text', 'test-reblog'],
      ['reply-id', replyId],
      ['path', 'path'],
      ['files', 'file-1,file-2']
    ])
  })

  it('reblog to tumblr with tags', () => {
    const replyId = 'test-reply-id|test-tumblelog-uuid|test-reblog-key'
    const inputs = {
      text: 'test-post',
      replyTo: replyId,
      tags: '["#tag1", "#tag2"]',
      ...config
    }

    const state = run(action.program(), inputs)

    expect(optics(state, s => s.postedTags)).toEqualRight(['#tag1', '#tag2'])
  })

  it('log reblogged tags', () => {
    const replyId = 'test-reply-id|test-tumblelog-uuid|test-reblog-key'
    const inputs = {
      text: 'test-reblog',
      replyTo: replyId,
      tags: '["#tag1", "#tag2"]',
      ...config
    }

    const state = run(action.program(), inputs)

    expect(optics(state, s => s.logs)).toEqualRight([
      ['tags', '#tag1,#tag2'],
      ['text', 'test-reblog'],
      ['reply-id', replyId]
    ])
  })
})
