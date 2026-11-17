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
    // reportUnusedDisableDirectives: 'warn' and typeAware: true inherit from the default.
    // Add project-specific rules and overrides here.
});
```

Run from the consumer project root:

```bash
node node_modules/oxlint/bin/oxlint --deny-warnings src tests
```

`options.typeAware: true` **is inherited** from this shared config with Oxlint 1.94.0; `--type-aware` is not additionally required. The type program uses the nearest `tsconfig.json` for each file. The engine executable (`tsrs-lint`) must be discoverable; installing tsrs in the consumer provides it. This config does not enable compiler diagnostics (`typeCheck`); keep a separate typecheck gate.

`reportUnusedDisableDirectives` replaces `eslint-comments/no-unused-disable`. This package sets it to `'warn'` and it inherits, so extending the default is enough; set your own `options.reportUnusedDisableDirectives` (or pass `--report-unused-disable-directives-severity`) to override it. Warnings alone exit 0; **always pass `--deny-warnings`** for a lint gate.

JavaScript/TypeScript and `*.test.*`/`*.spec.*` overrides are inherited and match files relative to the **consumer config**, not this installed package. Integration tests verify both TS-only rules and test relaxations from a separate temporary consumer.

Root-only fields
----------------

Oxlint 1.94.0 does **not** inherit some fields from an extended config object. The self-check pins this table with a probe package, so a different Oxlint behavior fails the suite:

| Field | Inherited through `extends`? | What this package does |
| --- | --- | --- |
| `env` (root) | no | Without it `process` in an `.mjs` file is a false `no-undef`. The default sets `env` inside an `overrides` entry, which **is** inherited, so extending the default alone is enough. `root.env` carries the same value for the consumer root. |
| `globals` (root) | no | None shipped. Put project globals in an `overrides` entry (inherited) or at your root. |
| `settings` | no | `bunTest.settings` (`jest.globalPackage = 'bun:test'`) and the `boundaries` add-on's settings must be set at the consumer root: `settings: { ...root.settings, ...bunTest.settings, ...architecture.settings }`. `root.settings` is `{}` today and reserved for future base settings, so spreading it keeps consumers forward compatible. |
| `ignorePatterns` | no | None shipped; set your own (`node_modules/`, `dist/`) at the root. |
| `options` | **yes**, field by field (verified: `typeAware`, `reportUnusedDisableDirectives`, `maxWarnings`); the consumer's own value wins | `typeAware: true` and `reportUnusedDisableDirectives: 'warn'` are set here. |
| `env`/`globals` inside `overrides` | yes | Used for `env` above. |
| `rules`, `overrides`, `plugins`, `jsPlugins`, `categories` | yes | Everything else this package ships. |

`root` is `{ env: { builtin: true, node: true, es2024: true }, settings: {} }`.

Linting package.json
--------------------

Oxlint does not lint JSON, so `package.json` stays on ESLint. The `package-json` subpath is a minimal ESLint flat config that loads only [eslint-plugin-package-json](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json) (its `recommended` set: required fields, value validity, alphabetical `sort-collections`, `unique-dependencies`, `specify-peers-locally` and the tidiness rules; `strict` is irrelevant here). It does not load `@hughescr/eslint-config-default`, so the step takes about 0.1 s instead of 0.5 s. Re-export it from a config file of your own (here `eslint.package-json.config.mjs`) and run ESLint on `package.json` alone:

```js
// eslint.package-json.config.mjs
export { default } from '@hughescr/oxlint-config-default/package-json';
```

```bash
bun add -D eslint            # the runner; this package depends on eslint but a transitive install does not guarantee a bin in your project
eslint -c eslint.package-json.config.mjs package.json        # add --fix for sort-collections, repository-shorthand, require-type
```

Options are the plugin's defaults: `require-attribution` ignores private packages, `no-empty-fields` allows an empty `files`, `repository-shorthand` wants the object form, `sort-collections` covers `config`, `dependencies`, `devDependencies`, `exports`, `optionalDependencies`, `overrides`, `peerDependencies`, `peerDependenciesMeta` and `scripts`. Top-level key order is not enforced (`order-properties` is not in the recommended set).

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

A configuration-only probe on Oxlint 1.94.0 confirms that all seven JS rules fire for `bun:test`, while all seven native counterparts stay silent for the same imports. Native `settings.jest` supports only `version`; `globalPackage`, `globalAliases`, Jest globals/environment and tsconfig aliases do not fix import recognition. Native Vitest also ignores these imports and has no `no-done-callback` counterpart. Keep `eslint-plugin-jest` until native import-source support is available; upstream tracks the missing setting in [oxc-project/oxc#23290](https://github.com/oxc-project/oxc/issues/23290).

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

Ambiguous placements: `dynamically-constructed-templates` and `link-with-target-blank` are in Frameworks (template and HTML rules); `disabled-timeout` (mocha) and the three rules that lose their typed behaviour without types (`assertions-in-tests`, `no-incompatible-assertion-types`, `synchronous-exception-assertions`) are in TestTooling; `os-command`, `sql-queries`, `xml-parser-xxe`, `hardcoded-secret-signatures`, `review-blockchain-mnemonic`, `production-debug`, `file-uploads`, `disabled-auto-escaping` and `dompurify-unsafe-config` are in Web; `no-commented-code`, `arguments-order` (weak without types), `no-redundant-optional`, and `no-control-regex` are catch-alls in Style. The built-in `no-control-regex` is deliberately off, matching the shared ESLint config: it is stricter than the SonarJS rule, notably for intentional control-character sanitiser ranges, so it is not equivalent coverage.

**Reliability wrapper.** Oxlint 1.94.0 gives every linted file the same `context.sourceCode` object, and eslint-plugin-sonarjs 4.2.2 caches per-file import data keyed by that object's identity and never clears it. Rules gated on "is a test framework imported" therefore go silent depending on which file is linted first, differently from run to run with threads (stock plugin: wrong in 4 of 6 runs). `plugins/sonarjs-oxlint.mjs` clears the plugin's own per-file cache once per file; with it 6 of 6 runs are correct. The wrapper reaches into the plugin's internal `helpers/module.js`, so **`eslint-plugin-sonarjs` is pinned to an exact version** in `dependencies`; re-verify the self-check's repeat-run test before bumping it. The mechanism is isolated in one function so it can be replaced without touching the rule data.

#### What covers each dropped SonarJS rule

The 38 SonarJS rules that duplicate an enabled rule, two that duplicate built-ins the default enables for the purpose (`no-new`, `oxc/missing-throw`), and 13 more that earlier versions of this package enabled are not in any default or opt-in group. A self-check verifies every listed covering rule is actually enabled by the default (or by `bunTest`).

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

### `boundaries` and `defineBoundaries`

Optional architecture rules ([eslint-plugin-boundaries](https://www.jsboundaries.dev/) v7, `boundaries/dependencies`: which layer may import which). The package ships the plugin as a jsPlugin (absolute specifier) and the TypeScript import resolver setting it needs (`eslint-import-resolver-typescript`, also a dependency of this package, addressed by absolute path), and no project policy. The bare `boundaries` export is exactly that (`jsPlugins` plus `settings`). Projects normally call `defineBoundaries`, which adds the layer list and the dependency policy once and returns an extendable add-on:

```ts
import config, { bunTest, defineBoundaries, root } from '@hughescr/oxlint-config-default';
import { defineConfig } from 'oxlint';

const architecture = defineBoundaries({
    files: ['src/**/*.ts'],                                   // where the rule runs (an Oxlint override)
    elements: [                                               // boundaries/elements: the layers
        { type: 'utils', pattern: 'src/utils/**' },
        { type: 'agent', pattern: 'src/agent/**' },
    ],
    dependencies: {                                           // options of boundaries/dependencies
        default: 'disallow',
        policies: [{ from: { element: { type: 'agent' } }, allow: { to: { element: { type: ['utils'] } } } }],
    },
    // optional: fileCategories (boundaries/files), ignore (boundaries/ignore), tsconfig ('./tsconfig.json'), severity ('error')
});

export default defineConfig({
    ...root,
    extends: [config, bunTest, architecture],
    settings: { ...root.settings, ...bunTest.settings, ...architecture.settings },   // settings never inherit: merge at the root
});
```

`architecture` is `{ jsPlugins, settings, overrides }`: the plugin, the settings (`import/resolver`, `boundaries/elements`, and `boundaries/files` / `boundaries/ignore` when given) and one override that runs `boundaries/dependencies` on `files` at the given severity. Because Oxlint does not inherit `settings` through `extends` (see [Root-only fields](#root-only-fields)), **omitting `...architecture.settings` at the root silences the rule** (the plugin only warns that no element descriptors were provided). `defineBoundaries` throws if `elements`, `dependencies` or `files` is missing. The policy shape is the plugin's own; see its documentation for `policies`, selectors and `fileInternalPath`.

Known constraint: the rule resolves the `elements` globs and the resolver's `tsconfig` against the **working directory**, so run Oxlint from the repo root (`node node_modules/oxlint/bin/oxlint ...`), never from a subfolder. Violations are suppressed with `// eslint-disable-next-line boundaries/dependencies -- reason`, and `reportUnusedDisableDirectives` reports one that is no longer needed.

Disable comments and ast-grep
----------------------------

Native and JS plugin names such as `eslint`, `unicorn`, `import`/`import-x`, `n`/`node`, and `jest` cannot overlap. Leftover ESLint rules therefore use `eslint-core`, `unicorn-js`, `import-x-js`, `n-js`, and `jest-js`. Existing disable comments must use the actual Oxlint rule id after migration (for example `eslint-core/require-atomic-updates`, `import-x-js/order`).

All jsPlugin paths are absolute, resolved from this package with `createRequire(import.meta.url).resolve(...)`; they do not depend on plugin packages being hoisted into a consumer's node_modules.

Directive policy is enforced outside Oxlint, so a disable cannot suppress its own policy diagnostic. Add the package's ast-grep rules to `sgconfig.yml`:

```yaml
ruleDirs:
  - node_modules/@hughescr/oxlint-config-default/ast-grep
```

Then run `ast-grep scan`. Each logical rule includes TypeScript, JavaScript/JSX, and TSX variants (`<id>`, `<id>-javascript`, `<id>-tsx`), severity `error`. Project-specific `no-restricted-syntax` policies (rules that name your own paths, modules or APIs) belong in your own `ruleDirs` entry, not in the core wrapper and not here.

| Rule id | File | Replaces |
| --- | --- | --- |
| `eslint-disable-bare` | `eslint-disable-bare.yml` | `eslint-comments/no-unlimited-disable`; rejects bare `eslint-disable*` and `oxlint-disable*` directives |
| `eslint-disable-needs-description` | `eslint-disable-needs-description.yml` | `eslint-comments/require-description` for disables; rejects disable directives without ` -- reason` (also native Oxlint disables) |
| `directive-block-disable-not-at-top` | `directive-block-disable-not-at-top.yml` | Whole-file disables only before all code; no scoped regions to pair |
| `directive-no-enable` | `directive-no-enable.yml` | Forbids every `eslint-enable` / `oxlint-enable` directive |
| `directive-no-inline-config` | `directive-no-inline-config.yml` | Forbids `eslint`, `global`, `globals`, `exported`, `eslint-env` inline configuration |
| `sonar-comma-or-logical-or-case` | `sonar-comma-or-logical-or-case.yml` | `sonarjs/comma-or-logical-or-case` |
| `sonar-no-collection-size-mischeck` | `sonar-no-collection-size-mischeck.yml` | `sonarjs/no-collection-size-mischeck` |
| `sonar-no-equals-in-for-termination` | `sonar-no-equals-in-for-termination.yml` | `sonarjs/no-equals-in-for-termination` |
| `sonar-no-useless-increment` | `sonar-no-useless-increment.yml` | `sonarjs/no-useless-increment` |
| `sonar-reduce-initial-value` | `sonar-reduce-initial-value.yml` | `sonarjs/reduce-initial-value` |
| `no-silent-catch-undefined` | `no-silent-catch-undefined.yml` | ESLint `no-restricted-syntax` on `.catch(() => undefined)`; non-test source only |
| `no-test-set-timeout` | `no-test-set-timeout.yml` | ESLint `no-restricted-syntax` on `setTimeout(...)`; test paths only |
| `no-test-set-interval` | `no-test-set-interval.yml` | ESLint `no-restricted-syntax` on `setInterval(...)`; test paths only |
| `no-test-set-immediate` | `no-test-set-immediate.yml` | ESLint `no-restricted-syntax` on `setImmediate(...)`; test paths only |
| `no-test-queue-microtask` | `no-test-queue-microtask.yml` | ESLint `no-restricted-syntax` on `queueMicrotask(...)`; test paths only |
| `no-test-process-next-tick` | `no-test-process-next-tick.yml` | ESLint `no-restricted-syntax` on `process.nextTick`; test paths only |
| `no-test-promise-wrapped-set-timeout` | `no-test-promise-wrapped-set-timeout.yml` | ESLint `no-restricted-syntax` on `setTimeout` inside `new Promise(...)`; test paths only |
| `no-test-dynamic-await-import` | `no-test-dynamic-await-import.yml` | ESLint `no-restricted-syntax` on `await import(...)` (through `as`, `satisfies` and parentheses); test paths only |
| `no-test-bun-sleep` | `no-test-bun-sleep.yml` | ESLint `no-restricted-syntax` on `Bun.sleep(...)`; test paths only |

The `sonar-*` rules are purely syntactic and match without type information. A consumer that only wants directive policy should copy the five directive files (`eslint-disable-*` and `directive-*`) instead of adding the whole directory.

#### Directive policy (no eslint-comments plugin)

- Whole-file `eslint-disable` / `oxlint-disable` comments are allowed only in the file header, before **any code**. A leading shebang, licence/docblock/triple-slash comments and blank lines are fine. Multiple header disables are allowed. `'use strict'`, imports and even empty statements count as code. A comment inside a function or JSX expression is not a file header.
- Local exceptions use `disable-next-line` or `disable-line`; **enable directives are forbidden everywhere**. There are no scoped regions and no matching halves for later edits to break.
- Inline `eslint`, `global`, `globals`, `exported` and `eslint-env` config directives are forbidden. The old `no-use` allowed only `eslint-disable`, `eslint-enable`, `eslint-disable-line` and `eslint-disable-next-line`; the new policy additionally removes enables and covers native `oxlint-` disables.
- Every disable still needs an explicit rule list and a nonempty ` -- reason`.

All five rules inspect comment AST nodes, not text inside strings/templates. Header checking requires the comment's immediate parent to be the program and permits only comment/hashbang siblings before it. TypeScript, JavaScript/JSX and TSX variants share this policy. Both `/* … */` and `// …` forms are checked: real scans under **Oxlint 1.94.0, Node launcher**, confirm that `// eslint-disable rule` and `// oxlint-disable rule` suppress later findings as region disables, although ESLint ignores the line-comment block form. A consumer can impose stricter path-specific policy (for example, no whole-file disables under `src/`) in its own rule directory; shared-rule globs resolve relative to the consumer's `sgconfig.yml`.

| Old ESLint comments rule | Replacement / policy coverage | Evidence and limitations |
| --- | --- | --- |
| `no-unused-disable` | Native `options.reportUnusedDisableDirectives: 'warn'` | Unused next-line and native `oxlint-` disables warn. Always pass `--deny-warnings`. |
| `no-unused-enable` | `directive-no-enable` | All enables are rejected, used or unused. |
| `disable-enable-pair` (`allowWholeFile: true`) | `directive-block-disable-not-at-top` + `directive-no-enable` | Scoped regions are impossible; header-only whole-file disables need no matching enable. This is a deliberate stricter policy, not a stateful pairing emulation. |
| `no-duplicate-disable` | **Not exactly replaced** | Scoped duplicate regions are rejected by placement policy, but duplicate header/local disables are not generally detected. Oxlint 1.94.0 does **not** report a next-line disable as unused when the same rule is already disabled for the whole file (verified for both prefixes). No rule-list identity/state emulation is claimed. |
| `no-unlimited-disable` | `eslint-disable-bare` | Bare ESLint and Oxlint disables are rejected, including those with a reason. |
| `require-description` | `eslint-disable-needs-description` + bans on enables/config directives | All remaining allowed directive forms are disables and need a reason. |
| `no-use` | `directive-no-inline-config` + `directive-no-enable` | Inline config is forbidden; only header whole-file and local next-line/same-line disables remain. |
| `no-aggregating-enable` | Off in the old default; now `directive-no-enable` rejects all enables | No stateful aggregation check is needed. |
| `no-restricted-disable` | Off in the old default; unchanged | Explicit, reasoned disables are allowed subject to placement policy. |

#### Generic syntax bans

The nine `no-silent-catch-undefined` and `no-test-*` rules are generic `no-restricted-syntax` bans moved here from a consumer, so every consumer that adds the rule directory gets them. They are on by default (severity `error`). Consumers can suppress one site, omit a rule file, or pass `ast-grep scan --off=<id>`; to disable a logical rule for every language, repeat `--off` for `<id>`, `<id>-javascript` and `<id>-tsx`. Their messages recommend fake timers (`jest.useFakeTimers()` + `jest.advanceTimersByTime()`) and `await Promise.resolve()`, so the `no-test-*` set suits Bun/Jest-style test suites; a project with a different test runner should copy only the files it wants.

Scope is built into each rule's own globs, relative to the directory holding `sgconfig.yml` and independent of the consumer's layout:

- **Test paths** (the eight `no-test-*` rules): a `tests`, `test` or `__tests__` directory at any depth (`**/{tests,test,__tests__}/**`) and any `*.test.*` or `*.spec.*` file. Test helpers and fixtures under those directories are included. Directories merely containing the text (`contest/`, `latest/`) are not.
- **Non-test source** (`no-silent-catch-undefined`): every file of the rule's language *except* those same test paths, anywhere in the project (`src/`, `lib/`, `scripts/`, the root). Keep build output, vendored code and generated files out with `.gitignore` (ast-grep honours it) or the `--globs '!path/**'` option.

Suppress one site with the id in an ast-grep comment, as for any ast-grep rule: `// ast-grep-ignore: no-test-set-immediate -- reason`. The rule ids are the file names without `.yml`, and the variant ids carry a suffix (`-javascript`, `-tsx`), so a suppression in a `.tsx` or `.js` file must name that variant (`// ast-grep-ignore: no-test-set-timeout-tsx -- reason`).

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
| test-hygiene | 4 | 4 |
| module-boundaries wrapper | 2 | 2 |
| **Total active rules (ordinary source files)** | **451** | **504** |

Test overrides disable 15 rules for TS tests and swap the sonarjs core for its 13 test-file rules; shared JS test relaxations are also applied. Optional lodash adds 23 rules; optional bunTest adds 11; the sonarjs opt-in groups add 17, 28, 16, 14 and 25.

Explicit compatibility differences:

- `strict`, `n/no-unpublished-bin`, `n/process-exit-as-throw`: dropped by decision. `no-octal` and JS `no-dupe-args`: parser-covered in modules.
- The eleven typescript-eslint extension rules use Oxlint core equivalents. JS `dot-notation` uses the ESLint core wrapper; TS uses native `typescript/dot-notation`.
- `unicorn/numeric-separators-style`: enabled with **Oxlint's preferred behavior**, not ESLint's options.
- Oxlint rejects the printed options `preserve-caught-error.errorClassNames`, `unicorn/prefer-export-from.ignoreUsedVariables`, and all options for `unicorn/escape-case`, `number-literal-case`, `prefer-add-event-listener`, `prefer-array-find`, `prefer-array-flat`. These use supported options/default behavior instead. Catch-error-name's serialized RegExp options are restored as regex strings.
- The eslint-comments plugin is removed. Native unused-directive reporting plus five ast-grep directive rules enforce the stricter header-only/no-enable policy above; duplicate disables are not exactly covered.
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

Some have native, regexp, or compiler overlap; none is falsely enabled as though full typed coverage survived. Beyond those, the SonarJS rules that earlier versions of this package enabled and that now sit in no default are exactly the ones in the opt-in groups and the tables above. `package.json` is linted by ESLint through the `package-json` subpath, not reproduced in Oxlint.

Development
-----------

```bash
bun install
bun run test
bun run lint
bun pm pack --dry-run
```

Tests invoke Oxlint under **Node**, never Bun (Bun truncates piped output at 64 KiB). A temporary consumer imports the package by its bare name through a local symlink, like `bun link` without global registration. Set `TEST_PACKAGE_ROOT` to an independently installed package directory to run the same suite against an unpacked npm payload. Fixtures cover every native/plugin source and every optional export (including a two-layer `boundaries` project, one forbidden and one allowed import, run in the repeated multi-file run, and the `package-json` ESLint config against good, bad, private and duplicate-key manifests), a clean file, warning exit behavior, inherited TS/test overrides, inherited type-aware mode, which root fields inherit (a probe package), the sonarjs core scoping and every opt-in group, the sonarjs reliability wrapper (six repeated multi-file runs), the sonarjs rule partition (every rule is enabled in exactly one place or listed as dropped with a verified replacement), and every ast-grep rule (bad sample matches, good sample does not; the nine generic bans are scanned through a real `ruleDirs` sgconfig in every conventional test and source location, for each TypeScript, JavaScript and TSX extension, with exact matched lines and messages). Missing ast-grep produces a visible skip. The suite takes seconds, not minutes. Package maintenance lint uses native correctness/suspicious checks; consumer integration tests exercise the distributed, stricter configuration. There is no build, standalone typecheck, or mutation-test setup in this plain-ESM package.

Releases
--------

Work on `develop`; `main` holds releases. Git-flow prefixes and unprefixed version tags mirror `eslint-config-default`. The owner performs releases manually: `bun pm version --no-git-tag-version <patch|minor|major>`, then `git push github main develop --tags`, then `npm publish`.

```bash
bun pm version --no-git-tag-version minor # or patch / major
git push github main develop --tags
npm publish
```

`postversion` already commits package.json, starts and finishes the git-flow release, returns to `develop`, and merges `main`. The subsequent push is explicit. `npm publish` is **manual**, asks for web authorisation, and is not part of a script. Public npm access is declared in package.json. Do not run these commands merely to test the package. No version bump, tag, commit, push, global link, or publish is needed for local development.
