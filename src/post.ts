import * as A from 'fp-ts/Array'
import * as Effect from './effect'
import * as Validate from './validate'

export interface Post {
  id: string
  tumblelogId: string
  reblogKey: string
}

export function postDecoder<F extends Effect.URIS>(
  M: Effect.MonadThrow<F>,
  id: string | undefined
): Effect.Kind<F, Post> {
  const [maybePostId, maybeTumblelogId, maybeReblogKey] = id
    ? id.split('|')
    : []

  return M.map(
    A.sequence(M)([
      Validate.requiredF<F, string>(M, 'id')(maybePostId),
      Validate.requiredF<F, string>(M, 'tumblelogId')(maybeTumblelogId),
      Validate.requiredF<F, string>(M, 'reblogKey')(maybeReblogKey)
    ]),
    inputs => {
      const [postId, tumblelogId, reblogKey] = inputs

      const post: Post = {
        id: postId,
        tumblelogId,
        reblogKey
      }

      return post
    }
  )
}
