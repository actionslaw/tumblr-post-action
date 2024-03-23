import { Effect } from '../src/effect'
import { Post, postDecoder } from '../src/post'
import { InvalidField } from '../src/validate'

import '@relmify/jest-fp-ts'

describe('Post.postDecoder', () => {
  it('should decode post ID', async () => {
    const id = 'test-post-id|test-tumblelog-uuid|test-reply-key'
    const expectedPost: Post = {
      id: 'test-post-id',
      tumblelogId: 'test-tumblelog-uuid',
      reblogKey: 'test-reply-key'
    }

    const maybePost = await postDecoder(Effect, id)()

    expect(maybePost).toEqualRight(expectedPost)
  })

  it('should failed with invalid error on missing value', async () => {
    const id = 'test-post-id|test-tumblelog-uuid'
    const expectedError: InvalidField = new InvalidField('reblogKey', 'missing')

    const maybePost = await postDecoder(Effect, id)()

    expect(maybePost).toEqualLeft(expectedError)
  })
})
