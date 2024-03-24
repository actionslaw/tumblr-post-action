import * as Effect from '../src/effect'
import { GitHubActionsRuntime } from '../src/runtime'

describe('GitHubActionsRuntime', () => {
  it('should find all files in a folder', async () => {
    const maybeFolders = GitHubActionsRuntime.fs('./')
    expect((await Effect.runSync(maybeFolders)).length).toBeGreaterThan(0)
  })

  it('should ignore non-existent folder folder', async () => {
    const maybeFolders = GitHubActionsRuntime.fs('./non-existent')
    expect((await Effect.runSync(maybeFolders)).length).toBe(0)
  })
})
