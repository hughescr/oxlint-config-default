# CLAUDE.md — oxlint-config-default

## Project Overview

`@hughescr/oxlint-config-default` is a BSD-3-Clause shared Oxlint config. The source is the distributable: a single plain-JavaScript ESM `index.mjs`, with no build step. Do not export raw TypeScript from this package: Node cannot load it from `node_modules`.

This is a skeleton. The real rule mapping and JS plugin dependencies are not populated. Categories are off and only `no-debugger` is enabled at error severity. tsrs is the intended type-aware engine; no type-aware rules are configured yet.

## Commands

```bash
bun install
bun run test
bun run lint
bun pm version --no-git-tag-version patch # or minor, major
```

Write a failing self-check before changing behavior. `test/self-check.mjs` checks Oxlint's diagnostics and exit codes for bad and clean fixtures. The bad fixture intentionally fails lint and is excluded from the lint script. Keep checks small, deterministic, and dependency-free.

## Conventions

- 4-space indentation, single quotes, required semicolons, multiline trailing commas.
- Oxlint and tsrs are consumer-owned peer dependencies, with exact dev pins for local checks. Pin prerelease tsrs exactly in consuming projects.
- Resolve future bundled JS plugins through `jsPlugin(name, packageName)` in `index.mjs`; bare plugin specifiers resolve relative to the consumer and may fail.
- Do not add a build step or the full rule set as part of skeleton maintenance.

## Git and Releases

Work on `develop`; PRs target `develop`. `main` holds releases. Git-flow settings mirror the sibling `eslint-config-default`, including unprefixed version tags. Version starts at `0.0.0`; use a minor bump for the first `0.1.0` release.

`bun pm version --no-git-tag-version patch|minor|major` invokes the mirrored `postversion` script: commit package.json with `Bump package version to X.Y.Z`, start and finish the git-flow release, check out `develop`, and merge `main`.

No npm publishing command is documented in the reference README/CLAUDE.md, and no publish script exists there. This package likewise has no automatic publish step. Public npm access is declared in package.json. Do not push, publish, create a remote/repository, or run `bun link` without explicit authorization.
