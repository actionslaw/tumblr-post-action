# GitHub Action to create Tumblr posts

[![GitHub Super-Linter](https://github.com/actions/actionslaw/tumblr-post-action/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/actions/actionslaw/tumblr-post-action/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/actions/actionslaw/tumblr-post-action/workflows/check-dist.yml/badge.svg)](https://github.com/actions/actionslaw/tumblr-post-action/workflows/check-dist.yml)
[![CodeQL](https://github.com/actions/actionslaw/tumblr-post-action/workflows/codeql-analysis.yml/badge.svg)](https://github.com/actions/actionslaw/tumblr-post-action/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

Automatically post to Tumblr via Github Actions.

## Usage

Configure your workflow to use `actionslaw/tumblr-post-action@v1`, and provide
the post you want to send as the `text` input. You can specify a post you'd like
to reply to using the `replyTo` input. You can create image posts by setting the
`media` input to point to a folder containting images.

Provide the
[authentication keys and tokens](https://tumblr.github.io/tumblr.js/index.html#md:authentication)
for your Tumblr app as the `consumer-key`, `consumer-secret`, `access-token`,
and `access-token-secret` inputs.

You also need to specify your
[blog identifier](https://www.tumblr.com/docs/en/api/v2#blog-identifiers) as the
`consumer-key` identifier.

For example:

```yml
name: Post to Tumblr
on: [push]
jobs:
  tweet:
    runs-on: ubuntu-latest
    steps:
      - uses: actionslaw/tumblr-post-action@v1
        with:
          text: 'Hi, this is a test!'
          replyTo: https://tumblr.com/posts
          media: ./media
          consumer-key: ${{ secrets.TUMBLR_CONSUMER_API_KEY }}
          consumer-secret: ${{ secrets.TUMBLR_CONSUMER_API_SECRET }}
          access-token: ${{ secrets.TUMBLR_ACCESS_TOKEN }}
          access-token-secret: ${{ secrets.TUMBLR_ACCESS_TOKEN_SECRET }}
          blog-identifier: test.tumblr.com
```

Now whenever you push something to your repository, GitHub Actions will post on
your behalf.

## Development

After you've cloned the repository to your local machine or codespace, you'll
need to perform some initial setup steps.

> [!NOTE]
>
> You'll need to have a reasonably modern version of
> [Node.js](https://nodejs.org) handy (20.x or later should work!). If you are
> using a version manager like [`nodenv`](https://github.com/nodenv/nodenv) or
> [`nvm`](https://github.com/nvm-sh/nvm), this template has a `.node-version`
> file at the root of the repository that will be used to automatically switch
> to the correct version when you `cd` into the repository. Additionally, this
> `.node-version` file is used by GitHub Actions in any `actions/setup-node`
> actions.

1. :hammer_and_wrench: Install the dependencies

   ```bash
   npm install
   ```

1. :building_construction: Package the TypeScript for distribution

   ```bash
   npm run build
   ```

1. :white_check_mark: Run the tests

   ```bash
   $ npm test

   PASS  ./index.test.js
     ✓ throws invalid number (3ms)
     ✓ wait 500 ms (504ms)
     ✓ test runs (95ms)

   ...
   ```

To make a change:

1. Create a new branch

   ```bash
   git checkout -b new-feature
   ```

1. Add or modify the code in `src/`
1. Add or update the tests in `__tests__/`
1. Format, test, and build the action

   ```bash
   npm run all
   ```

   > [!WARNING]
   >
   > This step is important! It will run [`ncc`](https://github.com/vercel/ncc)
   > to build the final JavaScript action code with all dependencies included.
   > If you do not run this step, your action will not work correctly when it is
   > used in a workflow. This step also includes the `--license` option for
   > `ncc`, which will create a license file for all of the production node
   > modules used in your project.

1. Commit your changes

   ```bash
   git add .
   git commit -m "Added a new feature"
   ```

1. Push them to your repository

   ```bash
   git push -u origin new-feature
   ```

1. Create a pull request and get feedback on your action
1. Merge the pull request into the `main` branch

For information about versioning your action, see
[Versioning](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)
in the GitHub Actions toolkit.

### Publishing a New Release

This project includes a helper script, [`script/release`](./script/release)
designed to streamline the process of tagging and pushing new releases for
GitHub Actions.

GitHub Actions allows users to select a specific version of the action to use,
based on release tags. This script simplifies this process by performing the
following steps:

1. **Retrieving the latest release tag:** The script starts by fetching the most
   recent release tag by looking at the local data available in your repository.
1. **Prompting for a new release tag:** The user is then prompted to enter a new
   release tag. To assist with this, the script displays the latest release tag
   and provides a regular expression to validate the format of the new tag.
1. **Tagging the new release:** Once a valid new tag is entered, the script tags
   the new release.
1. **Pushing the new tag to the remote:** Finally, the script pushes the new tag
   to the remote repository. From here, you will need to create a new release in
   GitHub and users can easily reference the new tag in their workflows.
