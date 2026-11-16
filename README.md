@hughescr/oxlint-config-default
===============================

An explicit-rule Oxlint base for JavaScript and TypeScript, ported from `@hughescr/eslint-config-default` 6.0.1. Plain JavaScript ESM, no build step, BSD-3-Clause. All Oxlint categories are off: only listed rules run. Oxlint and its type engine are consumer-owned peers.

Installation and usage
----------------------

```bash
bun add -D @hughescr/oxlint-config-default oxlint@1.94.0 tsrs@0.25.0-ts7.1.0-beta
```

The package is currently unreleased (`0.0.0`). For local development, the owner can run `bun link` in this package and `bun link @hughescr/oxlint-config-default` in the consumer. Alternatively use a `file:` dependency. Keep the prerelease tsrs version pinned exactly.

Create `oxlint.config.ts` in the consumer root. **Spread `root` at the root and merge `root.settings` with `bunTest.settings`**; Oxlint does not inherit those fields through `extends` (see [Root-only fields](#root-only-fields)):

```ts
import config, { bunTest, root } from '@hughescr/oxlint-config-default';
import { defineConfig } from 'oxlint';

export default defineConfig({
    ...root,                                                  // env (and base settings): root-only fields
    extends: [config, bunTest],
    settings: { ...root.settings, ...bunTest.settings },      // merge your own project settings here too
    options: { reportUnusedDisableDirectives: 'warn' },
    // Add project-specific rules and overrides here.
});
```

Run from the consumer project root:

```bash
node node_modules/oxlint/bin/oxlint --deny-warnings src tests
```

`options.typeAware: true` **is inherited** from this shared config with Oxlint 1.94.0; `--type-aware` is not additionally required. The type program uses the nearest `tsconfig.json` for each file. The engine executable (`tsrs-lint`) must be discoverable; installing tsrs in the consumer provides it. This config does not enable compiler diagnostics (`typeCheck`); keep a separate typecheck gate.

`reportUnusedDisableDirectives` replaces `eslint-comments/no-unused-disable`. This package does not set it; set it as above, or pass `--report-unused-disable-directives-severity warn`. Warnings alone exit 0; **always pass `--deny-warnings`** for a lint gate.

JavaScript/TypeScript and `*.test.*`/`*.spec.*` overrides are inherited and match files relative to the **consumer config**, not this installed package. Integration tests verify both TS-only rules and test relaxations from a separate temporary consumer.

Root-only fields
----------------

Oxlint 1.94.0 does **not** inherit some fields from an extended config object. The self-check pins this table with a probe package, so a different Oxlint behavior fails the suite:

| Field | Inherited through `extends`? | What this package does |
| --- | --- | --- |
| `env` (root) | no | Without it `process` in an `.mjs` file is a false `no-undef`. The default sets `env` inside an `overrides` entry, which **is** inherited, so extending the default alone is enough. `root.env` carries the same value for the consumer root. |
| `globals` (root) | no | None shipped. Put project globals in an `overrides` entry (inherited) or at your root. |
| `settings` | no | `bunTest.settings` (`jest.globalPackage = 'bun:test'`) and module-boundaries settings must be set at the consumer root: `settings: { ...root.settings, ...bunTest.settings }`. `root.settings` is `{}` today and reserved for future base settings, so spreading it keeps consumers forward compatible. |
| `ignorePatterns` | no | None shipped; set your own (`node_modules/`, `dist/`) at the root. |
| `options` | **yes**, field by field (verified: `typeAware`, `reportUnusedDisableDirectives`, `maxWarnings`); the consumer's own value wins | Only `typeAware: true` is set here. |
| `env`/`globals` inside `overrides` | yes | Used for `env` above. |
| `rules`, `overrides`, `plugins`, `jsPlugins`, `categories` | yes | Everything else this package ships. |

`root` is `{ env: { builtin: true, node: true, es2024: true }, settings: {} }`.

Keep JSON linting on ESLint
--------------------------

Oxlint does not lint `package.json`. Continue running ESLint with the existing `@hughescr/eslint-config-default` for that file. No package-json plugin is shipped here.

Optional exports
----------------

### `lodash`

The 19 lodash and 4 lodash-es rules are omitted from the default because of their cost. Enable them only in projects that use those libraries:

```ts
import config, { lodash, root } from '@hughescr/oxlint-config-default';
import { defineConfig } from 'oxlint';
export default defineConfig({ ...root, extends: [config, lodash] });
```

A compatibility adapter supplies the legacy context methods used by eslint-plugin-lodash.

### `bunTest`

The ESLint shared default has no Jest rules. This optional config enables four native Jest rules and seven `jest-js` rules for `*.test.*` and `*.spec.*`. It has no project-specific syntax restrictions. The native plugin ignores Bun imports for seven rules, so those rules use eslint-plugin-jest instead.

Do not omit the root `settings` (see the usage example above): `jest.globalPackage = 'bun:test'` makes the JS-plugin rules recognize imported Bun test functions. Native rules are `no-commented-out-tests`, `prefer-hooks-in-order` (errors), `prefer-jest-mocked`, `prefer-spy-on` (warnings). JS rules are `expect-expect`, `no-disabled-tests`, `no-done-callback`, `no-duplicate-hooks`, `no-focused-tests`, `no-standalone-expect`, `prefer-hooks-on-top` (errors).

### `sonarjs` (core, in the default) and opt-in groups

SonarJS ships as a small reliable core plus opt-in groups, all loaded through one wrapper. JS plugins receive no TypeScript type information, so rules that are silent without types are never enabled.

**Core: `sonarjs` (47 rules, already included in the default; do not add it again).** Test-semantic rules run on test files only, general defect and security rules on non-test files, and four rules run on both. Test files are the package's `*.test.*`/`*.spec.*` globs.

- 34 general rules, non-test files only: `no-floating-point-equality no-hardcoded-ip no-identical-expressions no-duplicated-branches misplaced-loop-counter no-globals-shadowing pseudo-random no-ignored-exceptions file-permissions non-existent-operator no-invariant-returns inconsistent-function-call no-use-of-empty-return-value no-all-duplicated-branches no-unused-collection no-element-overwrite no-empty-collection weak-ssl no-weak-keys unverified-certificate no-clear-text-protocols publicly-writable-directories unverified-hostname encryption-secure-mode no-weak-cipher stateful-regex redundant-type-aliases memoize-cache-key avoid-mutating-nested-properties-of-shallow-clones anchor-precedence cognitive-complexity` (warn, 15) `regex-complexity` (20) `no-hardcoded-passwords no-hardcoded-secrets`.
- 9 test-semantic rules, test files only: `no-empty-test-file no-incomplete-assertions inverted-assertion-arguments parameterized-tests no-trivial-assertions async-test-assertions explicit-test-skip no-empty-parameterized-test-dataset no-duplicate-parameterized-test-case`.
- 4 rules on all files: `hashing no-identical-functions` (3) `no-os-command-from-path no-internal-api-use`.

Opt-in groups are config objects you add to `extends`, each loaded through the same wrapper and none part of the default. Membership is from the pruning evidence; rules whose group was ambiguous are listed below.

```ts
import config, { root, sonarjsAws, sonarjsWeb } from '@hughescr/oxlint-config-default';
import { defineConfig } from 'oxlint';
export default defineConfig({ ...root, extends: [config, sonarjsAws, sonarjsWeb] });
```

| Export | Rules | Content |
| --- | ---: | --- |
| `sonarjsAws` | 17 | all `aws-*` CDK/infrastructure rules |
| `sonarjsWeb` | 28 | cookie, header, CORS/CSRF/session and HTTP-library rules, plus general injection and secret security: `content-security-policy cookie-no-httponly cors csrf file-uploads insecure-cookie insecure-jwt-token no-mime-sniff no-referrer-policy no-session-cookies-on-static-assets session-regeneration strict-transport-security x-powered-by xml-parser-xxe hardcoded-secret-signatures production-debug review-blockchain-mnemonic os-command sql-queries disabled-auto-escaping dompurify-unsafe-config hidden-files no-mixed-content frame-ancestors confidential-information-logging no-ip-forward content-length no-intrusive-permissions` |
| `sonarjsFrameworks` | 16 | React, Vue, Angular, jQuery, axios, HTML and JSX: `link-with-target-blank no-angular-bypass-sanitization no-debounce-throttle-in-render no-hook-setter-in-body no-mutate-reactive-state-in-updated-hook no-useless-react-setstate no-uniq-key no-vue-class-component no-vue-mixins prefer-native-axios-alternative prefer-native-jquery-alternative table-header table-header-reference no-table-as-layout object-alt-content dynamically-constructed-templates` |
| `sonarjsTestTooling` | 14 | chai, cypress, mocha, testing-library, vitest and other test-tool rules, on test files only: `chai-determinate-assertion disabled-timeout no-debug-commands-in-ui-tests no-fixed-wait-in-tests no-forced-browser-interaction no-interpolation-in-inline-snapshots no-same-argument-assert prefer-cypress-should testing-library-prefer-query-by-disappearance testing-library-query-assertion vitest-mock-at-module-scope assertions-in-tests no-incompatible-assertion-types synchronous-exception-assertions` |
| `sonarjsStyle` | 25 | the 21 low-value style rules with the shared ESLint options (`no-nested-functions` threshold 5, `class-name`, `max-switch-cases` 30, `prefer-immediate-return` as a warning; `prefer-specific-assertions stable-tests test-check-exception` on test files only) plus `no-commented-code arguments-order no-redundant-optional no-control-regex` |

Ambiguous placements: `dynamically-constructed-templates` and `link-with-target-blank` are in Frameworks (template and HTML rules); `disabled-timeout` (mocha) and the three rules that lose their typed behaviour without types (`assertions-in-tests`, `no-incompatible-assertion-types`, `synchronous-exception-assertions`) are in TestTooling; `os-command`, `sql-queries`, `xml-parser-xxe`, `hardcoded-secret-signatures`, `review-blockchain-mnemonic`, `production-debug`, `file-uploads`, `disabled-auto-escaping` and `dompurify-unsafe-config` are in Web; `no-commented-code`, `arguments-order` (weak without types), `no-redundant-optional` and `no-control-regex` (nothing here covers it) are catch-alls in Style.

**Reliability wrapper.** Oxlint 1.94.0 gives every linted file the same `context.sourceCode` object, and eslint-plugin-sonarjs 4.2.2 caches per-file import data keyed by that object's identity and never clears it. Rules gated on "is a test framework imported" therefore go silent depending on which file is linted first, differently from run to run with threads (stock plugin: wrong in 4 of 6 runs). `plugins/sonarjs-oxlint.mjs` clears the plugin's own per-file cache once per file; with it 6 of 6 runs are correct. The wrapper reaches into the plugin's internal `helpers/module.js`, so **`eslint-plugin-sonarjs` is pinned to an exact version** in `dependencies`; re-verify the self-check's repeat-run test before bumping it. The mechanism is isolated in one function so it can be replaced without touching the rule data.

#### What covers each dropped SonarJS rule

The 38 SonarJS rules that duplicate an enabled rule, two that duplicate built-ins the default now enables for the purpose (`no-new`, `oxc/missing-throw`), and 13 more that earlier versions of this package enabled are not in any default or opt-in group. A self-check verifies every listed covering rule is actually enabled by the default (or by `bunTest`).

| SonarJS rule | Covered by |
| --- | --- |
| `sonarjs/assertions-in-test-cases` | `jest-js/no-standalone-expect` (`bunTest`), `jest-js/expect-expect` (`bunTest`) |
| `sonarjs/block-scoped-var` | `block-scoped-var` |
| `sonarjs/call-argument-line` | `no-unexpected-multiline` |
| `sonarjs/code-eval` | `no-eval`, `typescript/no-implied-eval` |
| `sonarjs/empty-string-repetition` | `regexp/confusing-quantifier`, `regexp/no-trivially-nested-quantifier` |
| `sonarjs/fixme-tag` | `no-warning-comments` |
| `sonarjs/for-loop-increment-sign` | `for-direction` |
| `sonarjs/function-inside-loop` | `no-loop-func` |
| `sonarjs/future-reserved-words` | compiler TS1212, TS1213 |
| `sonarjs/generator-without-yield` | `require-yield` |
| `sonarjs/hooks-before-test-cases` | `jest-js/prefer-hooks-on-top` (`bunTest`) |
| `sonarjs/no-case-label-in-switch` | `no-unused-labels` |
| `sonarjs/no-code-after-done` | `jest-js/no-done-callback` (`bunTest`) |
| `sonarjs/no-collapsible-if` | `unicorn/no-lonely-if` |
| `sonarjs/no-dead-store` | `no-useless-assignment` |
| `sonarjs/no-delete-var` | `no-delete-var` |
| `sonarjs/no-duplicate-in-composite` | `typescript/no-duplicate-type-constituents` |
| `sonarjs/no-exclusive-tests` | `jest-js/no-focused-tests` (`bunTest`) |
| `sonarjs/no-extra-arguments` | compiler TS2554 |
| `sonarjs/no-fallthrough` | `no-fallthrough` |
| `sonarjs/no-global-this` | compiler TS2683, TS7041 |
| `sonarjs/no-gratuitous-expressions` | `typescript/no-unnecessary-condition` |
| `sonarjs/no-identical-conditions` | `no-dupe-else-if`, `no-duplicate-case` |
| `sonarjs/no-implicit-global` | `no-undef` |
| `sonarjs/no-literal-call` | compiler TS2349 |
| `sonarjs/no-nested-conditional` | `no-nested-ternary`, `unicorn/no-nested-ternary` |
| `sonarjs/no-parameter-reassignment` | `no-param-reassign` |
| `sonarjs/no-primitive-wrappers` | `no-new-wrappers`, `typescript/no-wrapper-object-types` |
| `sonarjs/no-redundant-assignments` | `no-self-assign`, `no-useless-assignment` |
| `sonarjs/no-redundant-jump` | `no-useless-return` |
| `sonarjs/no-regex-spaces` | `no-regex-spaces` |
| `sonarjs/no-skipped-tests` | `jest-js/no-disabled-tests` (`bunTest`) |
| `sonarjs/no-unenclosed-multiline-block` | `curly`, `no-unexpected-multiline` |
| `sonarjs/no-useless-catch` | `no-useless-catch` |
| `sonarjs/prefer-default-last` | `default-case-last` |
| `sonarjs/super-linear-regex` | `regexp/no-super-linear-backtracking`, `regexp/no-super-linear-move` |
| `sonarjs/todo-tag` | `no-warning-comments` |
| `sonarjs/updated-const-var` | `no-const-assign` |
| `sonarjs/constructor-for-side-effects` | `no-new` (enabled in the default for this) |
| `sonarjs/no-unthrown-error` | `oxc/missing-throw` (enabled in the default for this) |
| `sonarjs/unused-import` | `no-unused-vars` |
| `sonarjs/bitwise-operators` | `no-bitwise` |
| `sonarjs/no-empty-character-class` | `regexp/no-empty-character-class` |
| `sonarjs/slow-regex` | `regexp/no-super-linear-backtracking`, `regexp/no-super-linear-move` |
| `sonarjs/no-invalid-regexp` | `regexp/no-invalid-regexp` |
| `sonarjs/no-misleading-character-class` | `regexp/no-misleading-unicode-character` |
| `sonarjs/duplicates-in-character-class` | `regexp/no-dupe-characters-character-class` |
| `sonarjs/no-empty-after-reluctant` | `regexp/no-useless-lazy`, `regexp/no-lazy-ends` |
| `sonarjs/single-character-alternation` | `regexp/prefer-character-class` |
| `sonarjs/no-empty-alternatives` | `regexp/no-empty-alternative` |
| `sonarjs/no-empty-group` | `regexp/no-empty-group`, `regexp/no-empty-capturing-group` |
| `sonarjs/concise-regex` | `regexp/prefer-d`, `regexp/prefer-w`, `regexp/prefer-plus-quantifier`, `regexp/prefer-star-quantifier`, `regexp/prefer-question-quantifier` |
| `sonarjs/single-char-in-character-classes` | `regexp/no-useless-character-class` |

Six more duplicate a built-in that this package does **not** enable, so they are **not covered**. Enable the named built-in in your own config if you want the coverage:

| SonarJS rule | Built-in that would cover it |
| --- | --- |
| `sonarjs/label-position` | `no-labels` |
| `sonarjs/no-labels` | `no-labels` |
| `sonarjs/no-duplicate-test-title` | `jest-js/no-identical-title` (with the `bunTest` settings) |
| `sonarjs/no-empty-test-title` | `jest-js/valid-title` (with the `bunTest` settings) |
| `sonarjs/synchronous-suite-callback` | `jest-js/valid-describe-callback` (with the `bunTest` settings) |
| `sonarjs/no-redundant-boolean` | `typescript/no-unnecessary-boolean-literal-compare` (type-aware; misses `a \|\| false`) |

Five rules are ported to ast-grep (next section): `sonarjs/comma-or-logical-or-case`, `sonarjs/no-collection-size-mischeck`, `sonarjs/no-equals-in-for-termination`, `sonarjs/no-useless-increment`, `sonarjs/reduce-initial-value`.

### `moduleBoundaries`

The two generic barrel rules are **already included in the default**. The named export also allows using only those rules, or adding the project-specific rule with options:

```ts
import config, { root } from '@hughescr/oxlint-config-default';
import { defineConfig } from 'oxlint';
export default defineConfig({
    ...root,
    extends: [config],
    settings: { ...root.settings, 'module-boundaries/tsconfig': 'tsconfig.json' },
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

The eslint-comments adapter repairs report locations, but Oxlint can suppress the diagnostics for bare disable directives. The package ships ast-grep rules, to be added to `sgconfig.yml`:

```yaml
ruleDirs:
  - node_modules/@hughescr/oxlint-config-default/ast-grep
```

Then run `ast-grep scan`. Each logical rule includes TypeScript, JavaScript/JSX, and TSX variants (`<id>`, `<id>-javascript`, `<id>-tsx`), severity `error`.

| Rule id | File | Replaces |
| --- | --- | --- |
| `eslint-disable-bare` | `eslint-disable-bare.yml` | `eslint-comments/no-unlimited-disable`; rejects bare `eslint-disable*` and `oxlint-disable*` directives |
| `eslint-disable-needs-description` | `eslint-disable-needs-description.yml` | `eslint-comments/require-description`; rejects directives without ` -- reason` (also native Oxlint directives) |
| `sonar-comma-or-logical-or-case` | `sonar-comma-or-logical-or-case.yml` | `sonarjs/comma-or-logical-or-case` |
| `sonar-no-collection-size-mischeck` | `sonar-no-collection-size-mischeck.yml` | `sonarjs/no-collection-size-mischeck` |
| `sonar-no-equals-in-for-termination` | `sonar-no-equals-in-for-termination.yml` | `sonarjs/no-equals-in-for-termination` |
| `sonar-no-useless-increment` | `sonar-no-useless-increment.yml` | `sonarjs/no-useless-increment` |
| `sonar-reduce-initial-value` | `sonar-reduce-initial-value.yml` | `sonarjs/reduce-initial-value` |

The wrapper handles other eslint-comments checks; its description rule is ESLint-comment-only, so ast-grep is also necessary for native Oxlint directives. Project-specific `no-restricted-syntax` policies belong in ast-grep, not the core wrapper. The `sonar-*` rules are purely syntactic and match without type information; a consumer that only wants the disable-comment checks should copy those two files instead of adding the whole directory.

Rule inventory and differences
------------------------------

The port uses the effective rule ids and options from the shared ESLint config itself, not consumer-local additions. The native/sonar-regexp/others mapping evidence determines native renames and compatibility adapters. `rules.mjs` groups the single-source data by origin. Severities are preserved except where explicitly noted below.

| Source | JavaScript | TypeScript |
| --- | ---: | ---: |
| Native core (including TS extension equivalents, `no-new`, `oxc/missing-throw`) | 109 | 95 |
| Native typescript | 0 | 68 |
| Native unicorn / unicorn-js | 124 / 8 | 124 / 8 |
| Native import / import-x-js | 7 / 3 | 7 / 3 |
| Native node / n-js | 5 / 10 | 5 / 10 |
| Native promise | 11 | 11 |
| eslint-core wrapper | 2 | 1 |
| sonarjs core (non-test files) | 38 | 38 |
| regexp | 61 | 61 |
| @stylistic | 67 | 67 |
| eslint-comments wrapper | 6 | 6 |
| test-hygiene | 4 | 4 |
| module-boundaries wrapper | 2 | 2 |
| **Total active rules (ordinary source files)** | **457** | **510** |

Test overrides disable 15 rules for TS tests and swap the sonarjs core for its 13 test-file rules; shared JS test relaxations are also applied. Optional lodash adds 23 rules; optional bunTest adds 11; the sonarjs opt-in groups add 17, 28, 16, 14 and 25.

Explicit compatibility differences:

- `strict`, `n/no-unpublished-bin`, `n/process-exit-as-throw`: dropped by decision. `no-octal` and JS `no-dupe-args`: parser-covered in modules.
- The eleven typescript-eslint extension rules use Oxlint core equivalents. JS `dot-notation` uses the ESLint core wrapper; TS uses native `typescript/dot-notation`.
- `unicorn/numeric-separators-style`: enabled with **Oxlint's preferred behavior**, not ESLint's options.
- Oxlint rejects the printed options `preserve-caught-error.errorClassNames`, `unicorn/prefer-export-from.ignoreUsedVariables`, and all options for `unicorn/escape-case`, `number-literal-case`, `prefer-add-event-listener`, `prefer-array-find`, `prefer-array-flat`. These use supported options/default behavior instead. Catch-error-name's serialized RegExp options are restored as regex strings.
- `@eslint-community/eslint-comments/no-unused-disable`: replaced by the consumer's root unused-directive option. Bare directives and description gaps require the bundled ast-grep rules.
- Generic `n/no-missing-import` and `n/no-unpublished-import`, disabled in the first consumer's local ESLint config, are retained as `n-js/*`. Node resolution may not understand Bun's extensionless TS imports and aliases; the generic ESLint config has the same limitation. Configure or disable these in a Bun consumer; the shared package does not impose a consumer-specific resolver.

The following **27 generic SonarJS rule ids are never enabled** (silent without types, except unsafe `void-use`). On TS files, `deprecation` is replaced by native `typescript/no-deprecated`, and `no-alphabetical-sort` by native `typescript/require-array-sort-compare` with `ignoreStringArrays: false`. Those two replacements preserve typed coverage but do not restore JS-only coverage. The remaining 25 have no full replacement:

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

Some have native, regexp, or compiler overlap; none is falsely enabled as though full typed coverage survived. Beyond those, the SonarJS rules that earlier versions of this package enabled and that now sit in no default are exactly the ones in the opt-in groups and the tables above. Package-json's 53 rules remain on ESLint rather than being reproduced here.

Development
-----------

```bash
bun install
bun run test
bun run lint
bun pm pack --dry-run
```

Tests invoke Oxlint under **Node**, never Bun (Bun truncates piped output at 64 KiB). A temporary consumer imports the package by its bare name through a local symlink, like `bun link` without global registration. Set `TEST_PACKAGE_ROOT` to an independently installed package directory to run the same suite against an unpacked npm payload. Fixtures cover every native/plugin source and every optional export, a clean file, warning exit behavior, inherited TS/test overrides, inherited type-aware mode, which root fields inherit (a probe package), the sonarjs core scoping and every opt-in group, the sonarjs reliability wrapper (six repeated multi-file runs), the sonarjs rule partition (every rule is enabled in exactly one place or listed as dropped with a verified replacement), and every ast-grep rule (bad sample matches, good sample does not). Missing ast-grep produces a visible skip. The suite takes seconds, not minutes. Package maintenance lint uses native correctness/suspicious checks; consumer integration tests exercise the distributed, stricter configuration. There is no build, standalone typecheck, or mutation-test setup in this plain-ESM package.

Releases
--------

Work on `develop`; `main` holds releases. Git-flow prefixes and unprefixed version tags mirror `eslint-config-default`. The owner performs releases manually: `bun pm version --no-git-tag-version <patch|minor|major>`, then `git push github main develop --tags`, then `npm publish`.

```bash
bun pm version --no-git-tag-version minor # or patch / major
git push github main develop --tags
npm publish
```

`postversion` already commits package.json, starts and finishes the git-flow release, returns to `develop`, and merges `main`. The subsequent push is explicit. `npm publish` is **manual**, asks for web authorisation, and is not part of a script. Public npm access is declared in package.json. Do not run these commands merely to test the package. No version bump, tag, commit, push, global link, or publish is needed for local development.
