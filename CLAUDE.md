# CLAUDE.md — oxlint-config-default

## Project

`@hughescr/oxlint-config-default` is a BSD-3-Clause shared Oxlint config ported from the generic effective `@hughescr/eslint-config-default` rules. Source is distributable plain-JavaScript ESM: `index.mjs`, grouped rule data in `rules.mjs`, compatibility adapters in `plugins/`, and disable-comment checks in `ast-grep/`. No build step or raw TypeScript package exports.

The default has all categories off and only explicit rules. It includes SonarJS for now, but its rule list and named config are isolated for pruning. Lodash/lodash-es and Bun/Jest rules are optional named exports. Generic module-boundaries rules are in the default; the cross-module rule requires consumer-owned options.

## Commands and checks

```bash
bun install
bun run test
bun run lint
bun pm pack --dry-run
```

Write a failing consumer self-check before changing behavior. `test/self-check.mjs` creates a temporary consumer with a local package symlink, never a global Bun link. It checks every source and optional export, type-aware behavior, shared override globs, clean diagnostics, warning exit behavior, and ast-grep directive coverage. Keep fixtures small and total suite time in seconds. A missing ast-grep binary must produce a visible skip. No mutation-testing or standalone typecheck infrastructure exists here.

Run Oxlint under **Node**, including subprocesses in tests: `node node_modules/oxlint/bin/oxlint`. Bun truncates large piped output. Keep diagnostics in temporary files and summarize them. Local maintenance lint uses native correctness/suspicious rules; the integration suite exercises the full distributed config.

## Config contracts

- 4-space indentation, single quotes, semicolons, multiline trailing commas.
- Oxlint and tsrs remain consumer-owned peer dependencies with exact dev pins; consumers must pin prerelease tsrs exactly.
- Every jsPlugin specifier must be absolute, resolved relative to this package with `createRequire(import.meta.url).resolve(...)`, not relative to a consumer.
- Reserved native plugin names require aliases for ESLint leftovers: `eslint-core`, `unicorn-js`, `import-x-js`, `n-js`, `jest-js`.
- JS plugins receive no TS type services. Never enable SonarJS rules classified silent in the mapping evidence; `sonarjs/void-use` stays off because it over-reports without types. Document degraded coverage honestly.
- `options.typeAware` inherits from an extended shared object in Oxlint 1.94.0. Type programs come from each file's nearest tsconfig. Engine installation/discovery is consumer-owned.
- `settings` does **not** inherit from an extended object in 1.94.0: Bun/Jest consumers must set root `settings: bunTest.settings`. Module-boundaries settings are likewise consumer-root settings.
- Shared JS/TS/test overrides match against the consumer's config location; self-checks must keep testing that boundary.
- `reportUnusedDisableDirectives` is root-only: consumers must set it or pass `--report-unused-disable-directives-severity warn`. Consumers must pass `--deny-warnings` for a lint gate.
- The comments adapter needs the bundled ast-grep rules to cover self-suppressed bare directives and missing descriptions. Preserve JS, TS, and TSX variants.
- No `no-restricted-syntax` core-wrapper rules: consumer syntax bans belong in ast-grep.
- Keep package.json linting on the existing ESLint shared config, not Oxlint.
- Do not copy consumer-specific restrictions, module policies, resolver paths, or mock reset options into the shared default.

## Git and releases

Work on `develop`; PRs target `develop`. `main` holds releases. Git-flow settings and the existing `postversion` script mirror the sibling `eslint-config-default`, including unprefixed version tags. Version remains `0.0.0` until the owner releases it.

The owner runs `bun pm version --no-git-tag-version <patch|minor|major>`, then `git push github main develop --tags`, then manual `npm publish` (only with explicit release authorization):

```bash
bun pm version --no-git-tag-version minor # or patch / major
git push github main develop --tags
npm publish
```

`postversion` commits package.json with `Bump package version to X.Y.Z`, starts and finishes a git-flow release, checks out `develop`, and merges `main`. The push is separate. **Manual `npm publish` asks for web authorisation**; it is not automated. Do not run a release, commit, push, tag, publish, or global `bun link` while merely implementing or testing a change.
