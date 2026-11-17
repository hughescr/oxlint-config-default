# CLAUDE.md — oxlint-config-default

## Project

`@hughescr/oxlint-config-default` is a BSD-3-Clause shared Oxlint config ported from the generic effective `@hughescr/eslint-config-default` rules. Source is distributable plain-JavaScript ESM: `index.mjs`, grouped rule data in `rules.mjs`, compatibility adapters in `plugins/`, and ast-grep rules in `ast-grep/` (five directive-policy checks, five syntactic SonarJS ports and nine generic test/silent-catch syntax bans, each with TypeScript, JavaScript and TSX variants). No build step or raw TypeScript package exports.

The default has all categories off and only explicit rules. Its SonarJS block is a 47-rule reliable core (`sonarjs` export): general defect/security rules on non-test files, test-semantic rules on test files, four on both. Everything else SonarJS is dropped from the default: the covering rule is in the README table, or the rule is in an opt-in export (`sonarjsAws`, `sonarjsWeb`, `sonarjsFrameworks`, `sonarjsTestTooling`, `sonarjsStyle`). Lodash/lodash-es, Bun/Jest rules and the `boundaries` architecture add-on are optional named exports; `./package-json` is a separate ESLint entry point (`package-json.mjs`). Generic module-boundaries rules are in the default; the cross-module rule requires consumer-owned options. `root` holds the root-only fields (`env`, base `settings`).

## Commands and checks

```bash
bun install
bun run test
bun run lint
bun pm pack --dry-run
```

Write a failing consumer self-check before changing behavior. `test/self-check.mjs` creates a temporary consumer with a local package symlink, never a global Bun link. It checks every source and optional export, type-aware behavior, shared override globs, clean diagnostics, warning exit behavior, which root fields inherit (a probe package), the sonarjs rule partition and scoping, the sonarjs wrapper's repeated multi-file run, every opt-in sonarjs group, the `boundaries` fixture (in the repeated run) and the `package-json` ESLint config (good, bad, private, duplicate-key manifests), and ast-grep coverage (directive checks, the five ported rules and nine generic syntax bans, including bad/good samples, language variants, test-path scoping and installed-ruleDir resolution). Keep fixtures small and total suite time in seconds. A missing ast-grep binary must produce a visible skip. No mutation-testing or standalone typecheck infrastructure exists here.

Run Oxlint under **Node**, including subprocesses in tests: `node node_modules/oxlint/bin/oxlint`. Bun truncates large piped output. Keep diagnostics in temporary files and summarize them. Local maintenance lint uses native correctness/suspicious rules; the integration suite exercises the full distributed config.

## Config contracts

- 4-space indentation, single quotes, semicolons, multiline trailing commas.
- Oxlint and tsrs remain consumer-owned peer dependencies with exact dev pins; consumers must pin prerelease tsrs exactly.
- Every jsPlugin specifier must be absolute, resolved relative to this package with `createRequire(import.meta.url).resolve(...)`, not relative to a consumer.
- Reserved native plugin names require aliases for ESLint leftovers: `eslint-core`, `unicorn-js`, `import-x-js`, `n-js`, `jest-js`.
- JS plugins receive no TS type services. Never enable SonarJS rules classified silent in the mapping evidence (`sonarjsSilent`); `sonarjs/void-use` stays off because it over-reports without types. Document degraded coverage honestly.
- Every SonarJS block (core and the opt-in groups) loads through `plugins/sonarjs-oxlint.mjs`, never the stock plugin: Oxlint 1.94.0 shares one `context.sourceCode` across files and eslint-plugin-sonarjs caches imports per `sourceCode` identity, which silences test-gated rules depending on file order. The wrapper calls the plugin's internal `clearFileCaches`, so `eslint-plugin-sonarjs` stays pinned to an exact version; re-run the self-check's repeat-run test before bumping it. A generic per-file wrapper for all plugins may replace the mechanism later (`resetPerFileState` is the single swap point).
- SonarJS membership is a partition: every rule is enabled in exactly one of the core or an opt-in group, or is listed in `sonarjsCovered` (with enabled covering ids), `sonarjsNotCovered`, `sonarjsAstGrep` or `sonarjsSilent`. The self-check enforces it and that the README names every dropped rule. Keep the README's "what covers each dropped rule" table in step with `rules.mjs`.
- Do not add a duplicate of an enabled rule to the core; add it to `sonarjsCovered` instead. `sonarjsStyle` has 25 rules, including `sonarjs/no-control-regex`; the stricter built-in `no-control-regex` is deliberately not enabled by default and is not equivalent coverage.
- Inherited through `extends` in Oxlint 1.94.0: `rules`, `overrides` (including `env`/`globals` set inside an override), `plugins`, `jsPlugins`, `categories`, and `options` field by field (`typeAware`, `reportUnusedDisableDirectives`, `maxWarnings`, with the consumer's value winning). **Not** inherited: root `env`, `globals`, `ignorePatterns` and `settings`. The default therefore ships `env` in an override, and `root` (`env` plus base `settings`) is for the consumer root. Bun/Jest consumers must set root `settings: { ...root.settings, ...bunTest.settings }`; the `boundaries` add-on's settings are likewise consumer-root settings. Type programs come from each file's nearest tsconfig; engine installation/discovery is consumer-owned. The self-check's probe package pins this table.
- Shared JS/TS/test overrides match against the consumer's config location; self-checks must keep testing that boundary.
- The default sets `options.reportUnusedDisableDirectives: 'warn'` (inherited; a consumer's own value wins). Consumers must pass `--deny-warnings` for a lint gate.
- Directive policy is enforced by five ast-grep rules, with no eslint-comments plugin/adapter: whole-file disables only before code (comments/hashbang/whitespace may precede them), no enables anywhere, no inline eslint/global/globals/exported/eslint-env config, explicit rules and nonempty reasons required. `'use strict'` is code. Both block and line comments are checked (Oxlint honours line-comment region disables). Preserve JS/JSX, TS, and TSX variants. Duplicate header/local disables are not exactly covered by native unused reporting; do not claim otherwise.
- No `no-restricted-syntax` core-wrapper rules: consumer syntax bans belong in ast-grep.
- package.json linting stays on ESLint, not Oxlint (Oxlint cannot lint JSON): the `./package-json` subpath export (`package-json.mjs`) is a minimal flat config over `eslint-plugin-package-json`'s `recommended` set. It must not import `@hughescr/eslint-config-default` (that loads every plugin, 0.5 s versus 0.1 s). Keep `exports`, `files` and the `lint` script in step when adding entry points.
- `boundaries` / `defineBoundaries` is the optional eslint-plugin-boundaries add-on: plugin jsPlugin plus the `import/resolver` setting (resolver addressed by absolute path), no project policy. `defineBoundaries({ elements, dependencies, files, fileCategories?, ignore?, tsconfig?, severity? })` returns `{ jsPlugins, settings, overrides }`; consumers `extends` it and merge `.settings` at the root. The self-check covers the fixture inside the repeated multi-file run and the no-settings-merge silence.
- Do not copy consumer-specific restrictions, module policies, resolver paths, or mock reset options into the shared default.

## Git and releases

Work on `develop`; PRs target `develop`. `main` holds releases. Git-flow settings and the existing `postversion` script mirror the sibling `eslint-config-default`, including unprefixed version tags.

The owner runs `bun pm version --no-git-tag-version <patch|minor|major>`, then `git push github main develop --tags`, then manual `npm publish` (only with explicit release authorization):

```bash
bun pm version --no-git-tag-version minor # or patch / major
git push github main develop --tags
npm publish
```

`postversion` commits package.json with `Bump package version to X.Y.Z`, starts and finishes a git-flow release, checks out `develop`, and merges `main`. The push is separate. **Manual `npm publish` asks for web authorisation**; it is not automated. Do not run a release, commit, push, tag, publish, or global `bun link` while merely implementing or testing a change.
