@hughescr/oxlint-config-default
===============================

An explicit-rule Oxlint base for JavaScript and TypeScript, ported from `@hughescr/eslint-config-default` 6.0.1. Plain JavaScript ESM, no build step, BSD-3-Clause. All Oxlint categories are off: only listed rules run. Oxlint and its type engine are consumer-owned peers.

Installation and usage
----------------------

```bash
bun add -D @hughescr/oxlint-config-default oxlint@1.94.0 tsrs@0.25.0-ts7.1.0-beta
```

The package is currently unreleased (`0.0.0`). For local development, the owner can run `bun link` in this package and `bun link @hughescr/oxlint-config-default` in the consumer. Alternatively use a `file:` dependency. Keep the prerelease tsrs version pinned exactly.

Create `oxlint.config.ts` in the consumer root:

```ts
import config from '@hughescr/oxlint-config-default';
import { defineConfig } from 'oxlint';

export default defineConfig({
    extends: [config],
    options: { reportUnusedDisableDirectives: 'warn' },
    // Add project-specific rules and overrides here.
});
```

Run from the consumer project root:

```bash
node node_modules/oxlint/bin/oxlint --deny-warnings src tests
```

`options.typeAware: true` **is inherited** from this shared config with Oxlint 1.94.0; `--type-aware` is not additionally required. The type program uses the nearest `tsconfig.json` for each file. The engine executable (`tsrs-lint`) must be discoverable; installing tsrs in the consumer provides it. This config does not enable compiler diagnostics (`typeCheck`); keep a separate typecheck gate.

`reportUnusedDisableDirectives` is **root-only**, so set it in the consumer as above, or pass `--report-unused-disable-directives-severity warn`. It replaces `eslint-comments/no-unused-disable`. Warnings alone exit 0; **always pass `--deny-warnings`** for a lint gate.

JavaScript/TypeScript and `*.test.*`/`*.spec.*` overrides are inherited and match files relative to the **consumer config**, not this installed package. Integration tests verify both TS-only rules and test relaxations from a separate temporary consumer.

Keep JSON linting on ESLint
--------------------------

Oxlint does not lint `package.json`. Continue running ESLint with the existing `@hughescr/eslint-config-default` for that file. No package-json plugin is shipped here.

Optional exports
----------------

### `lodash`

The 19 lodash and 4 lodash-es rules are omitted from the default because of their cost. Enable them only in projects that use those libraries:

```ts
import config, { lodash } from '@hughescr/oxlint-config-default';
import { defineConfig } from 'oxlint';
export default defineConfig({ extends: [config, lodash] });
```

A compatibility adapter supplies the legacy context methods used by eslint-plugin-lodash.

### `bunTest`

The ESLint shared default has no Jest rules. This optional config enables four native Jest rules and seven `jest-js` rules for `*.test.*` and `*.spec.*`. It has no project-specific syntax restrictions. The native plugin ignores Bun imports for seven rules, so those rules use eslint-plugin-jest instead.

```ts
import config, { bunTest } from '@hughescr/oxlint-config-default';
import { defineConfig } from 'oxlint';
export default defineConfig({
    extends: [config, bunTest],
    // Oxlint 1.94 does not inherit settings from an extended object.
    settings: bunTest.settings,
    options: { reportUnusedDisableDirectives: 'warn' },
});
```

Do not omit the root `settings`: `jest.globalPackage = 'bun:test'` makes the JS-plugin rules recognize imported Bun test functions. Merge other project settings alongside it as needed. Native rules are `no-commented-out-tests`, `prefer-hooks-in-order` (errors), `prefer-jest-mocked`, `prefer-spy-on` (warnings). JS rules are `expect-expect`, `no-disabled-tests`, `no-done-callback`, `no-duplicate-hooks`, `no-focused-tests`, `no-standalone-expect`, `prefer-hooks-on-top` (errors).

### `sonarjs`

A standalone SonarJS config, **already included in the default**. Its clearly separated list in `rules.mjs` is the one place to prune this expensive source. Do not add it again when using the default. It can also be used on its own with `extends: [sonarjs]`.

JS plugins receive no TypeScript type information. Silent typed-only SonarJS rules and `void-use` are excluded. The mapping's non-silent SonarJS covered-by-other and drop-candidate rows are deliberately retained: generic ESLint enables those duplicates, and consumer-specific reasons such as not using SQL do not apply to a shared base. Non-silent degraded rules retain syntax-only behavior, not their full ESLint typed coverage. The three regexp rules `no-missing-g-flag`, `no-unused-capturing-group`, `no-useless-dollar-replacements` likewise have reduced coverage for type-dependent expressions.

### `moduleBoundaries`

The two generic barrel rules are **already included in the default**. The named export also allows using only those rules, or adding the project-specific rule with options:

```ts
import config from '@hughescr/oxlint-config-default';
import { defineConfig } from 'oxlint';
export default defineConfig({
    extends: [config],
    settings: { 'module-boundaries/tsconfig': 'tsconfig.json' },
    rules: {
        '@hughescr/module-boundaries/no-cross-module-internal': ['error', {
            modules: [
                { type: 'domain', pattern: 'src/domain/**' },
                { type: 'storage', pattern: 'src/storage/**' },
            ],
        }],
    },
});
```

The wrapper supplies syntax parsing and TS module resolution, not a type checker. It defaults to `tsconfig.json` relative to the lint process cwd. No project-specific module policies are imposed by this package.

Disable comments and ast-grep
----------------------------

Native and JS plugin names such as `eslint`, `unicorn`, `import`/`import-x`, `n`/`node`, and `jest` cannot overlap. Leftover ESLint rules therefore use `eslint-core`, `unicorn-js`, `import-x-js`, `n-js`, and `jest-js`. Existing disable comments must use the actual Oxlint rule id after migration (for example `eslint-core/require-atomic-updates`, `import-x-js/order`).

All jsPlugin paths are absolute, resolved from this package with `createRequire(import.meta.url).resolve(...)`; they do not depend on plugin packages being hoisted into a consumer's node_modules.

The eslint-comments adapter repairs report locations, but Oxlint can suppress the diagnostics for bare disable directives. Add these two complementary ast-grep checks to `sgconfig.yml`:

```yaml
ruleDirs:
  - node_modules/@hughescr/oxlint-config-default/ast-grep
```

Then run `ast-grep scan`. The rules reject bare directives and missing/empty ` -- reason` descriptions, for both `eslint-disable*` and `oxlint-disable*`. Each logical rule includes TypeScript, JavaScript/JSX, and TSX variants. The wrapper handles other eslint-comments checks; its description rule is ESLint-comment-only, so ast-grep is also necessary for native Oxlint directives. Project-specific `no-restricted-syntax` policies belong in ast-grep, not the core wrapper.

Rule inventory and differences
------------------------------

The port uses the effective rule ids and options from the shared ESLint config itself, not consumer-local additions. The native/sonar-regexp/others mapping evidence determines native renames and compatibility adapters. `rules.mjs` groups the single-source data by origin. Severities are preserved except where explicitly noted below.

| Source | JavaScript | TypeScript |
| --- | ---: | ---: |
| Native core (including TS extension equivalents) | 107 | 93 |
| Native typescript | 0 | 68 |
| Native unicorn / unicorn-js | 124 / 8 | 124 / 8 |
| Native import / import-x-js | 7 / 3 | 7 / 3 |
| Native node / n-js | 5 / 10 | 5 / 10 |
| Native promise | 11 | 11 |
| eslint-core wrapper | 2 | 1 |
| sonarjs | 177 | 177 |
| regexp | 61 | 61 |
| @stylistic | 67 | 67 |
| eslint-comments wrapper | 6 | 6 |
| test-hygiene | 4 | 4 |
| module-boundaries wrapper | 2 | 2 |
| **Total active rules (ordinary source files)** | **594** | **647** |

Test overrides disable 15 rules for TS tests; shared JS test relaxations are also applied. Optional lodash adds 23 rules; optional bunTest adds 11.

Explicit compatibility differences:

- `strict`, `n/no-unpublished-bin`, `n/process-exit-as-throw`: dropped by decision. `no-octal` and JS `no-dupe-args`: parser-covered in modules.
- The eleven typescript-eslint extension rules use Oxlint core equivalents. JS `dot-notation` uses the ESLint core wrapper; TS uses native `typescript/dot-notation`.
- `unicorn/numeric-separators-style`: enabled with **Oxlint's preferred behavior**, not ESLint's options.
- Oxlint rejects the printed options `preserve-caught-error.errorClassNames`, `unicorn/prefer-export-from.ignoreUsedVariables`, and all options for `unicorn/escape-case`, `number-literal-case`, `prefer-add-event-listener`, `prefer-array-find`, `prefer-array-flat`. These use supported options/default behavior instead. Catch-error-name's serialized RegExp options are restored as regex strings.
- `@eslint-community/eslint-comments/no-unused-disable`: replaced by the consumer's root unused-directive option. Bare directives and description gaps require the bundled ast-grep rules.
- Generic `n/no-missing-import` and `n/no-unpublished-import`, disabled in the first consumer's local ESLint config, are retained as `n-js/*`. Node resolution may not understand Bun's extensionless TS imports and aliases; the generic ESLint config has the same limitation. Configure or disable these in a Bun consumer; the shared package does not impose a consumer-specific resolver.

The following **27 generic SonarJS rule ids are omitted** (silent without types, except unsafe `void-use`). On TS files, `deprecation` is replaced by native `typescript/no-deprecated`, and `no-alphabetical-sort` by native `typescript/require-array-sort-compare` with `ignoreStringArrays: false`. Those two replacements preserve typed coverage but do not restore JS-only coverage. The remaining 25 have no full replacement:

```text
sonarjs/deprecation
sonarjs/no-ignored-return
sonarjs/null-dereference
sonarjs/no-selector-parameter
sonarjs/index-of-compare-to-positive-number
sonarjs/post-message
sonarjs/no-array-delete
sonarjs/no-alphabetical-sort
sonarjs/new-operator-misuse
sonarjs/different-types-comparison
sonarjs/no-associative-arrays
sonarjs/void-use
sonarjs/argument-type
sonarjs/in-operator-type-error
sonarjs/array-callback-without-return
sonarjs/function-return-type
sonarjs/no-misleading-array-reverse
sonarjs/no-useless-intersection
sonarjs/no-in-misuse
sonarjs/no-try-promise
sonarjs/disabled-resource-integrity
sonarjs/unused-named-groups
sonarjs/existing-groups
sonarjs/jsx-no-leaked-render
sonarjs/prefer-regexp-exec
sonarjs/prefer-read-only-props
sonarjs/no-async-constructor
```

Some have native, regexp, or compiler overlap; none is falsely enabled as though full typed coverage survived. No other active generic JS/TS rule is omitted, apart from the five intentional/parser cases and the optional lodash rules noted above. Package-json's 53 rules remain on ESLint rather than being reproduced here.

Development
-----------

```bash
bun install
bun run test
bun run lint
bun pm pack --dry-run
```

Tests invoke Oxlint under **Node**, never Bun (Bun truncates piped output at 64 KiB). A temporary consumer imports the package by its bare name through a local symlink, like `bun link` without global registration. Set `TEST_PACKAGE_ROOT` to an independently installed package directory to run the same suite against an unpacked npm payload. Fixtures cover every native/plugin source and every optional export, a clean file, warning exit behavior, inherited TS/test overrides, inherited type-aware mode, root unused-directive reporting, and both ast-grep checks. Missing ast-grep produces a visible skip. The suite takes seconds, not minutes. Package maintenance lint uses native correctness/suspicious checks; consumer integration tests exercise the distributed, stricter configuration. There is no build, standalone typecheck, or mutation-test setup in this plain-ESM package.

Releases
--------

Work on `develop`; `main` holds releases. Git-flow prefixes and unprefixed version tags mirror `eslint-config-default`. The owner performs releases manually: `bun pm version --no-git-tag-version <patch|minor|major>`, then `git push github main develop --tags`, then `npm publish`.

```bash
bun pm version --no-git-tag-version minor # or patch / major
git push github main develop --tags
npm publish
```

`postversion` already commits package.json, starts and finishes the git-flow release, returns to `develop`, and merges `main`. The subsequent push is explicit. `npm publish` is **manual**, asks for web authorisation, and is not part of a script. Public npm access is declared in package.json. Do not run these commands merely to test the package. No version bump, tag, commit, push, global link, or publish is needed for local development.
