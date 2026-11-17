# CLAUDE.md — oxlint-config-default

## Project

`@hughescr/oxlint-config-default` is a BSD-3-Clause shared Oxlint config ported from the generic effective `@hughescr/eslint-config-default` rules. Source is distributable plain-JavaScript ESM: `index.mjs`, grouped rule data in `rules.mjs`, compatibility adapters in `plugins/`, and 25 logical ast-grep rules in `ast-grep/` (five directive-policy checks, seven syntactic SonarJS ports, four literal security tripwires and nine generic test/silent-catch syntax bans, each with TypeScript, JavaScript and TSX variants). No raw TypeScript runtime exports. tsrs generates `.d.mts` declarations from the `.mjs` source and JSDoc at pack time; both entry points expose them through `exports.types`.

The default has all categories off and only explicit rules: 413 active rules on ordinary JS source and 466 on TS source. `eslint-plugin-sonarjs` is not used, and no SonarJS config exports exist. The README's former-rule replacement table names native/plugin, compiler and ast-grep coverage without claiming semantic equivalence. Lodash/lodash-es (23 rules), Bun/Jest (12 rules) and the `moduleBoundaries` jsPlugin entry are optional named exports; `./package-json` is a separate ESLint entry point (`package-json.mjs`). `defineBoundaries` is re-exported from `@hughescr/oxlint-plugin-module-boundaries`. The two generic barrel rules of that native plugin are in the default; the two policy rules (`dependencies`, `no-cross-module-internal`) run only through a consumer's `defineBoundaries` policy. `root` holds the root-only fields (`env`, base `settings`).

## Commands and checks

```bash
bun install
bun run build:types # declaration-only emit via tsconfig.types.json; also run by prepack
bun run test
bun run lint
bun pm pack --dry-run
```

Write a failing consumer self-check before changing behavior. `test/self-check.mjs` creates a temporary consumer with a local package symlink, never a global Bun link. It checks every source and optional export, type-aware behavior, shared override globs, clean diagnostics, warning exit behavior, root-field inheritance, SonarJS absence, Bun assertion checking, resolved JS/TS option parity, the `defineBoundaries` fixture (forbidden edge, deep import past a barrel, type-only edge used as a value, unassigned file, allowed imports; no root `settings`; also from another working directory and with the linted directory named through a symlink) with the one-plugin-copy contract, and the `package-json` ESLint config (good, bad, private, duplicate-key manifests). Ast-grep checks cover bad/good samples, language variants, test-path scoping and installed-ruleDir resolution; the six new port/tripwire fixture directories carry `expected.json` with exact bad-file lines. Every rule file must appear in the README. Keep fixtures small and total suite time in seconds. A missing ast-grep binary must produce a visible skip. A second consumer uses the packed tarball as a real directory in node_modules, not a symlink: it checks the README settings merge plus `defineBoundaries` with type-aware lint (including an unsafe sentinel), a consumer TypeScript check with negative cases, packed declaration files, export wiring, and runtime/declaration export parity for both entry points and the internal rules module. No mutation-testing infrastructure exists here. `build:types` is declaration-only; it does not enable `checkJs` or replace the consumer typecheck. Both it and prepack run the Node-only `build-types.mjs` helper, which removes exactly the three generated declaration outputs before compiling all three source modules; otherwise adjacent stale declarations can shadow imported source. Never hand-write or commit generated declarations; maintain their JSDoc source annotations instead.

Run Oxlint under **Node**, including subprocesses in tests: `node node_modules/oxlint/bin/oxlint`. Bun truncates large piped output. Keep diagnostics in temporary files and summarize them. Local maintenance lint uses native correctness/suspicious rules; the integration suite exercises the full distributed config.

## Config contracts

- 4-space indentation, single quotes, semicolons, multiline trailing commas.
- Oxlint and tsrs remain consumer-owned peer dependencies with exact dev pins; consumers must pin prerelease tsrs exactly.
- Every jsPlugin specifier must be absolute, resolved relative to this package with `createRequire(import.meta.url).resolve(...)`, not relative to a consumer.
- Reserved native plugin names require aliases for ESLint leftovers: `eslint-core`, `unicorn-js`, `import-x-js`, `n-js`, `jest-js`.
- JS plugins receive no TS type services. Scope/value-tracking security and semantic rules have no full replacement: do not claim that literal tripwires restore SonarJS, framework, secret, injection, collection/return, duplicate-code or test-semantic analysis. The built-in `no-control-regex` is deliberately off.
- Keep the README's former SonarJS replacement table truthful. Seven syntax ports ship; `sonar-non-existent-operator` and `security-no-cleartext-url-literal` do not. `bunTest` uses `jest-js/valid-expect` with 1–2 args, `alwaysAwait: false` and async matchers `toReject` / `toResolve`. `unicorn/prefer-optional-catch-binding` covers unused catch bindings, not semantic handling of exceptions.
- Security tripwires match literal forms only, never import/value resolution; variables, aliases, constants and spreads are knowingly uncovered. Known misses per tripwire:
  - `security-no-reject-unauthorized-false`: indirect/computed/escaped keys, env destructuring or Object.assign, JSX, member assignments, Object.defineProperty, evaluated false/zero values, substituted templates, += / &&= and non-assertion wrappers.
  - `security-no-weak-hash-literal`: aliases/destructuring, dynamic properties, concatenation, substituted templates, spreads, bind/call/apply and other hash APIs (createHmac/pbkdf2).
  - `security-no-weak-cipher-literal`: dynamic properties, concatenation, spreads, parenthesized/non-null/indirect callees, options objects, non-first arguments and evaluated values; weak prefixes / literal -ecb text may match templates with substitutions.
  - `security-no-weak-tls-literal`: indirect/computed keys/values, shorthand, substituted templates, non-object assignments, evaluated expressions, escaped/case-variant spellings and other TLS options.
- Oxlint severity-only overrides reset options: reuse full base options where inheritance is intended (`no-shadow` uses `core['no-shadow']`, keeping `builtinGlobals: false`). Verify resolved JS/TS options with `--print-config`.
- Inherited through `extends` in Oxlint 1.94.0: `rules`, `overrides` (including `env`/`globals` set inside an override), `plugins`, `jsPlugins`, `categories`, and `options` field by field (`typeAware`, `reportUnusedDisableDirectives`, `maxWarnings`, with the consumer's value winning). **Not** inherited: root `env`, `globals`, `ignorePatterns` and `settings`. The default therefore ships `env` in an override, and `root` (`env` plus base `settings`) is for the consumer root. Bun/Jest consumers must set root `settings: { ...root.settings, ...bunTest.settings }`; the module-boundaries rules need no settings. Type programs come from each file's nearest tsconfig; engine installation/discovery is consumer-owned. The self-check's probe package pins this table.
- Shared JS/TS/test overrides match against the consumer's config location; self-checks must keep testing that boundary.
- The default sets `options.reportUnusedDisableDirectives: 'warn'` (inherited; a consumer's own value wins). Consumers must pass `--deny-warnings` for a lint gate.
- Directive policy is enforced by five ast-grep rules, with no eslint-comments plugin/adapter: whole-file disables only before code (comments/hashbang/whitespace may precede them), no enables anywhere, no inline eslint/global/globals/exported/eslint-env config, explicit rules and nonempty reasons required. `'use strict'` is code. Both block and line comments are checked (Oxlint honours line-comment region disables). Preserve JS/JSX, TS, and TSX variants. Duplicate header/local disables are not exactly covered by native unused reporting; do not claim otherwise.
- Every logical ast-grep rule has TypeScript, JavaScript/JSX and TSX variants with ids `<id>`, `<id>-javascript`, `<id>-tsx`, all severity `error`. Use `files` / `ignores` globs for test/non-test scoping (see `no-silent-catch-undefined.yml`); directory names must match at any depth, not substrings such as `contest`.
- No `no-restricted-syntax` core-wrapper rules: consumer syntax bans belong in ast-grep.
- package.json linting stays on ESLint, not Oxlint (Oxlint cannot lint JSON): the `./package-json` subpath export (`package-json.mjs`) is a minimal flat config over `eslint-plugin-package-json`'s `recommended` set. It must not import `@hughescr/eslint-config-default` (that loads every plugin, 0.5 s versus 0.1 s). Keep `exports`, `files` and the `lint` script in step when adding entry points.
- Module boundaries are the native `@hughescr/oxlint-plugin-module-boundaries` (2.x; no TypeScript program, no `settings`, no `typescript`/`eslint-plugin-boundaries`/resolver dependency). `moduleBoundaries` and the default load it by `jsPlugin('@hughescr/module-boundaries', '@hughescr/oxlint-plugin-module-boundaries')` (absolute specifier via `require.resolve`). `defineBoundaries` is the plugin's own, re-exported (never wrapped): its fragment `{ jsPlugins, overrides }` carries the policy as rule options and registers the same name and absolute specifier as the default. Oxlint 1.94.0 dedupes an identical `{ name, specifier }` entry across `extends` but refuses one name with two different files ("already registered"), so consumers must import `defineBoundaries` from this package, never from the plugin package; the self-check pins both and asserts the entries are equal. The plugin is a runtime dependency; `typescript` is a devDependency only (the typed-consumer `tsc` check).
- Do not copy consumer-specific restrictions, module policies, resolver paths, or mock reset options into the shared default.

## Git and releases

Work on `develop`; PRs target `develop`. `main` holds releases. Git-flow settings and the existing `postversion` script mirror the sibling `eslint-config-default`, including unprefixed version tags.

The owner runs `bun pm version --no-git-tag-version <patch|minor|major>`, then `git push github main develop --tags`, then manual `npm publish` (only with explicit release authorization):

```bash
bun pm version --no-git-tag-version minor # or patch / major
git push github main develop --tags
npm publish
```

`postversion` commits package.json with `Bump package version to X.Y.Z`, starts and finishes a git-flow release, checks out `develop`, and merges `main`. The push is separate. `prepack` regenerates declarations on both `bun pm pack` and `npm publish`; it invokes the dev-pinned tsrs compiler through Node without assuming Bun is on PATH. Install development dependencies first. **Manual `npm publish` asks for web authorisation**; it is not automated. Do not run a release, commit, push, tag, publish, or global `bun link` while merely implementing or testing a change.
