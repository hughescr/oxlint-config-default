@hughescr/oxlint-config-default
===============================

An explicit-rule Oxlint base for JavaScript and TypeScript, ported from `@hughescr/eslint-config-default` 6.0.1. Plain JavaScript ESM with TypeScript declarations generated at pack time, BSD-3-Clause. All Oxlint categories are off: only listed rules run. Oxlint and its type engine are consumer-owned peers.

Installation and usage
----------------------

```bash
bun add -D @hughescr/oxlint-config-default oxlint@1.94.0 tsrs@0.25.0-ts7.1.0-beta
```

Both entry points (`@hughescr/oxlint-config-default` and `@hughescr/oxlint-config-default/package-json`) ship generated `.d.mts` declarations, selected by their `exports.types` conditions. Consumers do not build this package.

The install command above is the normal route. For local development of this package against a consumer, run `bun link` in this package and `bun link @hughescr/oxlint-config-default` in the consumer, or use a `file:` dependency. Keep the prerelease tsrs version pinned exactly.

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
| `settings` | no | `bunTest.settings` (`jest.globalPackage = 'bun:test'`) must be set at the consumer root: `settings: { ...root.settings, ...bunTest.settings }`. `root.settings` is `{}` today and reserved for future base settings, so spreading it keeps consumers forward compatible. The module-boundaries rules read no settings (the policy is a rule option). |
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

The ESLint shared default has no Jest rules. This optional config enables four native Jest rules and eight `jest-js` rules for `*.test.*` and `*.spec.*`. It has no project-specific syntax restrictions. The JS plugin recognizes `bun:test` imports through the settings below.

Do not omit the root `settings` (see the usage example above): `jest.globalPackage = 'bun:test'` makes the JS-plugin rules recognize imported Bun test functions. Native rules are `no-commented-out-tests`, `prefer-hooks-in-order` (errors), `prefer-jest-mocked`, `prefer-spy-on` (warnings). JS rules are `expect-expect`, `no-disabled-tests`, `no-done-callback`, `no-duplicate-hooks`, `no-focused-tests`, `no-standalone-expect`, `prefer-hooks-on-top`, `valid-expect` (errors). `valid-expect` requires 1–2 arguments (Bun accepts an assertion message), a matcher, and awaited or returned async assertions, including Bun's `toReject` / `toResolve`; `alwaysAwait` is false so returning an assertion is allowed.

The self-check verifies `valid-expect` with real `bun:test` imports, including clean async assertions and assertion messages. A configuration-only probe on Oxlint 1.94.0 confirms that the other seven JS rules fire for `bun:test`, while their native counterparts stay silent for the same imports. Native `settings.jest` supports only `version`; `globalPackage`, `globalAliases`, Jest globals/environment and tsconfig aliases do not fix import recognition. Native Vitest also ignores these imports and has no `no-done-callback` counterpart. Keep `eslint-plugin-jest` until native import-source support is available; upstream tracks the missing setting in [oxc-project/oxc#23290](https://github.com/oxc-project/oxc/issues/23290).

SonarJS coverage
----------------

This package does not use `eslint-plugin-sonarjs`, in either the default or optional exports. Syntactic ports run through the ast-grep rule directory, and native/other plugin rules provide the replacements below. Compiler rows require a separate TypeScript check; typed rules do not restore JS-only coverage.

### Former sonarjs rule → what covers it now

| Former SonarJS rule | What covers it now |
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
| `sonarjs/comma-or-logical-or-case` | ast-grep `sonar-comma-or-logical-or-case` |
| `sonarjs/no-collection-size-mischeck` | ast-grep `sonar-no-collection-size-mischeck` |
| `sonarjs/no-equals-in-for-termination` | ast-grep `sonar-no-equals-in-for-termination` |
| `sonarjs/no-useless-increment` | ast-grep `sonar-no-useless-increment` |
| `sonarjs/reduce-initial-value` | ast-grep `sonar-reduce-initial-value` |
| `sonarjs/publicly-writable-directories` | ast-grep `sonar-publicly-writable-directories` (non-test paths) |
| `sonarjs/no-internal-api-use` | ast-grep `sonar-no-internal-api-use` (all paths) |
| `sonarjs/no-incomplete-assertions`, `sonarjs/async-test-assertions` | `jest-js/valid-expect` (`bunTest`; supported expect syntax only) |
| `sonarjs/no-ignored-exceptions` | `unicorn/prefer-optional-catch-binding` (unused catch bindings, not semantic error handling) |
| `sonarjs/deprecation` | `typescript/no-deprecated` (TS only) |
| `sonarjs/no-alphabetical-sort` | `typescript/require-array-sort-compare`, `ignoreStringArrays: false` (TS only) |
| `sonarjs/unverified-certificate` | ast-grep `security-no-reject-unauthorized-false` (literal tripwire only) |
| `sonarjs/hashing` | ast-grep `security-no-weak-hash-literal` (literal tripwire only) |
| `sonarjs/no-weak-cipher`, `sonarjs/encryption-secure-mode` | ast-grep `security-no-weak-cipher-literal` (literal tripwire only) |
| `sonarjs/weak-ssl` | ast-grep `security-no-weak-tls-literal` (literal tripwire only) |

Scope/value-tracking security and semantic rules are not covered: secret detection, permission/key strength, hostname verification, command/injection analysis, cleartext URLs, duplicate branches/functions, collection/loop/return analysis, test semantics beyond the enabled Jest checks, framework-specific rules and complexity/style checks have no equivalent here. The four security tripwires match literal forms only, not aliases, variables/constants, spreads or evaluated expressions; they do not resolve imports. Seven SonarJS ports ship, not a full SonarJS replacement. Built-ins such as `no-labels`, `jest-js/no-identical-title`, `jest-js/valid-title`, `jest-js/valid-describe-callback` and `typescript/no-unnecessary-boolean-literal-compare` are not enabled; no coverage is claimed for their former SonarJS counterparts.

### Former core rules with no replacement

The following 37 rules from the former 47-rule default core in 0.9.1 have no replacement (the other ten appear in the replacement table above):

- `sonarjs/no-floating-point-equality`
- `sonarjs/no-hardcoded-ip`
- `sonarjs/no-identical-expressions`
- `sonarjs/no-duplicated-branches`
- `sonarjs/misplaced-loop-counter`
- `sonarjs/no-globals-shadowing`
- `sonarjs/pseudo-random`
- `sonarjs/file-permissions`
- `sonarjs/non-existent-operator`
- `sonarjs/no-invariant-returns`
- `sonarjs/inconsistent-function-call`
- `sonarjs/no-use-of-empty-return-value`
- `sonarjs/no-all-duplicated-branches`
- `sonarjs/no-unused-collection`
- `sonarjs/no-element-overwrite`
- `sonarjs/no-empty-collection`
- `sonarjs/no-weak-keys`
- `sonarjs/no-clear-text-protocols`
- `sonarjs/unverified-hostname`
- `sonarjs/stateful-regex`
- `sonarjs/redundant-type-aliases`
- `sonarjs/memoize-cache-key`
- `sonarjs/avoid-mutating-nested-properties-of-shallow-clones`
- `sonarjs/anchor-precedence`
- `sonarjs/cognitive-complexity`
- `sonarjs/regex-complexity`
- `sonarjs/no-hardcoded-passwords`
- `sonarjs/no-hardcoded-secrets`
- `sonarjs/no-os-command-from-path`
- `sonarjs/no-identical-functions`
- `sonarjs/no-empty-test-file`
- `sonarjs/inverted-assertion-arguments`
- `sonarjs/parameterized-tests`
- `sonarjs/no-trivial-assertions`
- `sonarjs/explicit-test-skip`
- `sonarjs/no-empty-parameterized-test-dataset`
- `sonarjs/no-duplicate-parameterized-test-case`

### Known misses

Raw source spellings are matched; escape sequences are not decoded:

- `security-no-reject-unauthorized-false`: indirect/computed or escaped keys, destructured env / `Object.assign`, JSX attributes, member assignments, `Object.defineProperty`, evaluated false/zero values, substituted templates, `+=` / `&&=` and wrappers other than parentheses/TS assertions.
- `security-no-weak-hash-literal`: renamed/destructured aliases, dynamic properties, concatenation, substituted templates, spreads, `bind` / `call` / `apply` and other APIs such as `createHmac` / `pbkdf2`.
- `security-no-weak-cipher-literal`: dynamic properties, concatenation, spreads, indirect/parenthesized/non-null callees, options objects or non-first algorithm arguments, conditionals/calls hiding a value; weak prefixes and literal `-ecb` text in templates with substitutions may still match.
- `security-no-weak-tls-literal`: indirect/computed keys or values, shorthand, substituted templates, assignments outside object literals, evaluated expressions, case variants and other TLS options such as `ciphers`.

The writable-directory port likewise misses env aliases/destructuring, `globalThis.process` / `Bun.env`, dynamic keys, concatenated/constant paths, bare roots without a trailing slash and templates beginning with a substitution. The internal-API port covers literal import/export sources and bare `require()` / `import()` calls, not aliases, variables, spreads, concatenated/interpolated sources, receiver/bracket calls, `require.resolve()` or `import.meta.resolve()`.

### `moduleBoundaries`

The default loads the native Oxlint plugin [`@hughescr/oxlint-plugin-module-boundaries`](https://www.npmjs.com/package/@hughescr/oxlint-plugin-module-boundaries) 2.x (a dependency of this package; it needs no TypeScript program and no `settings`) under the name `@hughescr/module-boundaries`, and **already enables its two generic barrel rules**: `no-internal-in-barrel` (an `index.ts` re-exporting an `@internal` symbol) and `no-star-export-from-non-barrel`. They take no options. The named `moduleBoundaries` export is exactly that jsPlugins entry plus those two rules, for a config that does not extend the default. The two policy rules, `dependencies` and `no-cross-module-internal`, need a project policy: use `defineBoundaries`.

### `defineBoundaries`

Layer rules take one policy file per project and one `extends` entry. `defineBoundaries(policy)` validates the policy (it throws a `TypeError` naming the problem) and returns an Oxlint fragment, `{ jsPlugins, overrides }`, that registers the plugin and enables `dependencies` and `no-cross-module-internal` with the policy as rule options:

```js
// boundaries.config.mjs
import { defineBoundaries } from '@hughescr/oxlint-config-default';

export default defineBoundaries({
    root: import.meta.dirname,           // absolute project directory; every path and glob below is relative to it
    include: ['src/**'],                 // a linted file matching this that is in no module is reported
    ignore: ['**/*.{test,spec}.*'],
    modules: { utils: 'src/utils', agent: 'src/agent', main: 'src/index.ts' },   // a directory, or a file for a one-file module
    allow: { agent: ['utils'], main: ['agent'] },     // default deny: the modules each module may import
    // optional: allowTypeOnly (edges only `import type` may use), exceptions, entry ('index.ts'), tsconfig, severity ('error')
});
```

```ts
// oxlint.config.ts
import config, { bunTest, root } from '@hughescr/oxlint-config-default';
import { defineConfig } from 'oxlint';
import boundaries from './boundaries.config.mjs';

export default defineConfig({
    ...root,
    extends: [config, bunTest, boundaries],
    settings: { ...root.settings, ...bunTest.settings },   // nothing from the boundaries policy goes here
});
```

The fragment carries the policy as rule options, so there is **no `settings` merge**, and Oxlint may run from any working directory; files named through symlinks are matched against the policy by their real paths. The plugin needs Node `^20.19.0 || >=22.12.0`. The rules report an import along an edge the policy does not allow, a value import along a type-only edge, an import that skips the target module's entry file (a deep import past its barrel), an included file that belongs to no module, and a named import or re-export of an `@internal` export from another module. `import x = require('…')` is checked as a value import. The full policy reference (fields, `exceptions`, `entry`, `allowTypeOnly`) and rule details are in the plugin's own README, installed at `node_modules/@hughescr/oxlint-plugin-module-boundaries/README.md`. Suppress a finding with `// eslint-disable-next-line @hughescr/module-boundaries/dependencies -- reason`; `reportUnusedDisableDirectives` reports one that is no longer needed.

**Import `defineBoundaries` from this package, not from the plugin package.** Oxlint keys a jsPlugin by its `name` and refuses a second entry that carries the same name with a different file. Verified on Oxlint 1.94.0; the self-check pins both results:

- The same `{ name, specifier }` entry arriving through several `extends` entries (the default config plus the fragment, or the fragment twice) loads once, and each finding is reported once. Specifiers naming the same file by different paths (`..` segments, a symlink) were also accepted as one entry when tried by hand.
- The same name with two different files (two installed copies of the plugin, for example one in a policy file's own `node_modules` and one under this package) fails at config load: `Plugin name '@hughescr/module-boundaries' is already registered`.

This package depends on the plugin and re-exports its `defineBoundaries`, so the fragment's jsPlugins entry is the same name and absolute specifier as the default config's: both come from the one copy that Node resolves from this package. A policy file that imports `@hughescr/oxlint-plugin-module-boundaries` directly gets whichever copy resolves from the policy file's location, which can differ (nested installs, version skew) and then fails as above. The self-check asserts that the default's entry and the fragment's entry are identical, and that a second installed copy is refused.

Coming from the eslint-plugin-boundaries add-on (`boundaries`, `defineBoundaries({ elements, dependencies, files, ... })`, root `settings` merge): both are gone. Each `elements` entry becomes a `modules` entry, each `allow` policy becomes `allow[module]` (`dependency: { kind: 'type' }` becomes `allowTypeOnly`), `files` becomes `include`, `ignore` stays, "disallow `!index.ts`" is the default `entry`, and the root `settings` merge and the TypeScript resolver go away. Disable comments name `@hughescr/module-boundaries/dependencies` instead of `boundaries/dependencies`.

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
| `sonar-publicly-writable-directories` | `sonar-publicly-writable-directories.yml` | `sonarjs/publicly-writable-directories`; non-test paths |
| `sonar-no-internal-api-use` | `sonar-no-internal-api-use.yml` | `sonarjs/no-internal-api-use`; all paths |
| `security-no-reject-unauthorized-false` | `security-no-reject-unauthorized-false.yml` | Literal `rejectUnauthorized: false` and TLS verification env-disable tripwire; non-test paths |
| `security-no-weak-hash-literal` | `security-no-weak-hash-literal.yml` | Literal weak `createHash` / `crypto.subtle.digest` algorithms; non-test paths |
| `security-no-weak-cipher-literal` | `security-no-weak-cipher-literal.yml` | Literal weak cipher algorithms / ECB; non-test paths |
| `security-no-weak-tls-literal` | `security-no-weak-tls-literal.yml` | Literal insecure TLS options; non-test paths |
| `no-silent-catch-undefined` | `no-silent-catch-undefined.yml` | ESLint `no-restricted-syntax` on `.catch(() => undefined)`; non-test source only |
| `no-test-set-timeout` | `no-test-set-timeout.yml` | ESLint `no-restricted-syntax` on `setTimeout(...)`; test paths only |
| `no-test-set-interval` | `no-test-set-interval.yml` | ESLint `no-restricted-syntax` on `setInterval(...)`; test paths only |
| `no-test-set-immediate` | `no-test-set-immediate.yml` | ESLint `no-restricted-syntax` on `setImmediate(...)`; test paths only |
| `no-test-queue-microtask` | `no-test-queue-microtask.yml` | ESLint `no-restricted-syntax` on `queueMicrotask(...)`; test paths only |
| `no-test-process-next-tick` | `no-test-process-next-tick.yml` | ESLint `no-restricted-syntax` on `process.nextTick`; test paths only |
| `no-test-promise-wrapped-set-timeout` | `no-test-promise-wrapped-set-timeout.yml` | ESLint `no-restricted-syntax` on `setTimeout` inside `new Promise(...)`; test paths only |
| `no-test-dynamic-await-import` | `no-test-dynamic-await-import.yml` | ESLint `no-restricted-syntax` on `await import(...)` (through `as`, `satisfies` and parentheses); test paths only |
| `no-test-bun-sleep` | `no-test-bun-sleep.yml` | ESLint `no-restricted-syntax` on `Bun.sleep(...)`; test paths only |

The directory contains 25 logical rules (75 language variants): five directive checks, seven SonarJS syntax ports, four literal security tripwires and nine generic syntax bans. The `sonar-*` and `security-*` rules are purely syntactic and match without type information. A consumer that only wants directive policy should copy the five directive files (`eslint-disable-*` and `directive-*`) instead of adding the whole directory.

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

The port uses the effective rule ids and options from the shared ESLint config itself, not consumer-local additions. The native/regexp/other-plugin mapping evidence determines native renames and compatibility adapters. `rules.mjs` groups the single-source data by origin. Severities are preserved except where explicitly noted below.

| Source | JavaScript | TypeScript |
| --- | ---: | ---: |
| Native core (including TS extension equivalents, `no-new`, `oxc/missing-throw`) | 109 | 95 |
| Native typescript | 0 | 68 |
| Native unicorn / unicorn-js | 124 / 8 | 124 / 8 |
| Native import / import-x-js | 7 / 3 | 7 / 3 |
| Native node / n-js | 5 / 10 | 5 / 10 |
| Native promise | 11 | 11 |
| eslint-core wrapper | 2 | 1 |
| regexp | 61 | 61 |
| @stylistic | 67 | 67 |
| test-hygiene | 4 | 4 |
| module-boundaries (generic barrel rules) | 2 | 2 |
| **Total active rules (ordinary source files)** | **413** | **466** |

Test overrides disable 11 active rules for TS tests; shared JS test relaxations are also applied. Optional lodash adds 23 rules; optional bunTest adds 12. The 25 ast-grep logical rules run separately and are not included in the Oxlint totals.

Explicit compatibility differences:

- `strict`, `n/no-unpublished-bin`, `n/process-exit-as-throw`: dropped by decision. `no-octal` and JS `no-dupe-args`: parser-covered in modules.
- The eleven typescript-eslint extension rules use Oxlint core equivalents. JS `dot-notation` uses the ESLint core wrapper; TS uses native `typescript/dot-notation`.
- `unicorn/numeric-separators-style`: enabled with **Oxlint's preferred behavior**, not ESLint's options.
- Oxlint rejects the printed options `preserve-caught-error.errorClassNames`, `unicorn/prefer-export-from.ignoreUsedVariables`, and all options for `unicorn/escape-case`, `number-literal-case`, `prefer-add-event-listener`, `prefer-array-find`, `prefer-array-flat`. These use supported options/default behavior instead. Catch-error-name's serialized RegExp options are restored as regex strings.
- The eslint-comments plugin is removed. Native unused-directive reporting plus five ast-grep directive rules enforce the stricter header-only/no-enable policy above; duplicate disables are not exactly covered.
- Generic `n/no-missing-import` and `n/no-unpublished-import`, disabled in the first consumer's local ESLint config, are retained as `n-js/*`. Node resolution may not understand Bun's extensionless TS imports and aliases; the generic ESLint config has the same limitation. Configure or disable these in a Bun consumer; the shared package does not impose a consumer-specific resolver.

TypeScript overrides repeat base options when only severity is intended to change: Oxlint resets options on a severity-only override. In particular, `no-shadow` shares its base options in JS and TS; `builtinGlobals` remains false. `package.json` is linted by ESLint through the `package-json` subpath, not reproduced in Oxlint.

Development
-----------

```bash
bun install
bun run build:types # also runs automatically via prepack
bun run test
bun run lint
bun pm pack --dry-run
```

Tests invoke Oxlint under **Node**, never Bun (Bun truncates piped output at 64 KiB). A temporary consumer imports the package by its bare name through a local symlink, without global registration. Set `TEST_PACKAGE_ROOT` to an independently installed package directory to run the same suite against an unpacked npm payload. Fixtures cover every native/plugin source and optional export, a three-module `defineBoundaries` project (a forbidden edge, a deep import past a barrel, a type-only edge used as a value, an unassigned file, and allowed value and type-only imports) run with no root `settings` and from a different working directory, the one-plugin-copy contract (the fragment's jsPlugins entry equals the default's; a second installed copy is refused), the `package-json` ESLint config (good, bad, private and duplicate-key manifests), clean diagnostics, warning exit behavior, inherited TS/test overrides, type-aware mode and root-field inheritance. Regression checks require SonarJS to be absent, verify `bun:test` assertion checking and compare JS/TS `no-shadow` options using `--print-config`. Every ast-grep rule has bad/clean samples; the generic bans and six new port/tripwire fixtures run through a real installed `ruleDirs` sgconfig across all eight supported extensions and conventional test/source locations, comparing exact lines, language ids and severity. The README must name every shipped rule file. Missing ast-grep produces a visible skip. The suite takes seconds, not minutes. Package maintenance lint uses native correctness/suspicious checks; integration tests exercise the distributed config. A second consumer installs the packed payload as a real directory (not a symlink): the README config plus `defineBoundaries` (typed policy, misspelt module names rejected) must have no unsafe type-aware findings, an unsafe sentinel must be reported, TypeScript positive/negative checks must pass, and packed declarations must match runtime exports, including the internal `rules.mjs` data module. `bun run build:types` and prepack use the Node-only `build-types.mjs` helper to remove the three generated outputs before tsrs declaration-only emit from `.mjs` sources and JSDoc via `tsconfig.types.json`; adjacent stale declarations must not shadow the sources during later builds. Generated `.d.mts` files are git-ignored, never hand-written or committed. JavaScript source checking is not enabled; there is no mutation-test setup.

Releases
--------

Work on `develop`; `main` holds releases. Git-flow prefixes and unprefixed version tags mirror `eslint-config-default`. The owner performs releases manually: `bun pm version --no-git-tag-version <patch|minor|major>`, then `git push github main develop --tags`, then `npm publish`.

```bash
bun pm version --no-git-tag-version minor # or patch / major
git push github main develop --tags
npm publish
```

`postversion` already commits package.json, starts and finishes the git-flow release, returns to `develop`, and merges `main`. The subsequent push is explicit. `npm publish` is **manual**, asks for web authorisation, and is not part of a script. Both `bun pm pack` and `npm publish` run `prepack` to regenerate declarations from source; the hook invokes tsrs through Node and does not require Bun on the npm publisher's PATH. Install development dependencies before packing or publishing. Public npm access is declared in package.json. Do not run these commands merely to test the package. No version bump, tag, commit, push, global link, or publish is needed for local development.
