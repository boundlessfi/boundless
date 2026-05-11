# Vendored dependencies

This directory contains pre-built tgz packages of dependencies that are NOT
on a public npm registry. They are referenced from the root `package.json`
as `file:./vendor/<name>-<version>.tgz` so production deploys (Railway, CI,
anywhere) work without needing to check out sibling source repos.

## Current contents

| File                                   | Source repo                                   | Why vendored                                                                            |
| -------------------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------- |
| `smart-account-kit-0.3.0.tgz`          | https://github.com/kalepail/smart-account-kit | Not published to npm at this version; we depend on commits past the latest npm publish. |
| `smart-account-kit-bindings-0.1.0.tgz` | (sub-package of above)                        | Workspace package of SAK; not available standalone on npm.                              |

## How to update

When you want to pick up new commits from the SAK upstream:

```bash
./scripts/update-sak.sh           # pulls latest main, rebuilds, re-vendors
./scripts/update-sak.sh --no-pull # use whatever's already checked out locally
```

This:

1. Runs `git pull` in the sibling `../smart-account-kit/` checkout
2. Runs `pnpm install && pnpm build` there
3. Runs `pnpm pack` (NOT `npm pack` — npm doesn't resolve `workspace:*` refs)
4. Moves the tgz files here, replacing the existing ones
5. Updates `package.json` if the version bumped
6. Reinstalls in boundless

Then commit:

```bash
git add vendor/ package.json package-lock.json
git commit -m "chore: bump vendored smart-account-kit"
```

## Why not symlinks / `file:../smart-account-kit`

The sibling-repo `file:` reference only works on a developer's machine where
both repos are cloned side-by-side. On Railway / CI, only the `boundless` repo
gets cloned — the sibling path doesn't exist and `npm install` fails.

Vendoring the tgz files into this directory keeps the install hermetic.

## Why `pnpm pack` and not `npm pack`

The SAK repo is a pnpm workspace. Its `package.json` references its sub-package
with the `workspace:*` protocol, which npm doesn't understand. `pnpm pack`
resolves `workspace:*` to a concrete version (e.g. `0.1.0`) before producing
the tarball. `npm pack` leaves it as-is, and a downstream `npm install` blows
up with `EUNSUPPORTEDPROTOCOL`.

The update script always uses `pnpm pack`.
