# Contributing

## Testing

In order to keep it really simple we use TAP running in Docker.

## Submitting Changes

If you would like to submit a pull request please first raise an issue to track the change that you'd like to make (whether a new feature or a bug fix). Then issue the PR against that issue.

Please add the issue number in each of the [atomic commits](https://www.freshconsulting.com/atomic-commits/) that comprise the branch, for example:

> [#123] Add mappings from core API to harbor-master style

Other than prefixing with the issue number please follow [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/).

## Coding Conventions

Although we're not completely convinced that removing semicolons makes things *easier* to read, adopting StandardJS *is* easy...so we have.

<a href="https://standardjs.com" style="padding: 0 0 20px 20px;"><img src="https://cdn.rawgit.com/feross/standard/master/sticker.svg" alt="Standard JavaScript" width="100"></a>

## Repo Linting

The repo is linted against this set of rules:

https://github.com/markbirbeck/my-repolinter

<img src="https://github.com/todogroup/repolinter/raw/master/docs/images/P_RepoLinter01_logo_only.png" alt="Repo Linter" width="300">