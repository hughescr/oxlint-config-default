@hughescr/oxlint-config-default
===============================

Shared Oxlint base config for JavaScript and TypeScript projects. **Skeleton only:** the rule set is not yet populated. All categories are off; only `no-debugger: 'error'` is enabled as a working example. No JS plugins are bundled yet.

- Plain JavaScript ESM, single `index.mjs` export, no build step
- BSD-3-Clause license
- Oxlint with tsrs as the intended type-aware engine; type-aware rules are not configured yet

Installation and usage
----------------------

Once the package is available, install it alongside consumer-owned engines:

```bash
bun add -D @hughescr/oxlint-config-default oxlint@1.94.0 tsrs@0.25.0-ts7.1.0-beta
```

Oxlint and tsrs are peer dependencies, not bundled engines. tsrs is a prerelease: consumers should pin its version exactly. This local skeleton has not been published or linked.

Create `oxlint.config.ts`:

```ts
import config from '@hughescr/oxlint-config-default';
import { defineConfig } from 'oxlint';

export default defineConfig({
    extends: [config],
    // Add project-specific rules and overrides here.
});
```

The package stays JavaScript because Node does not load raw TypeScript exports from `node_modules`. Future bundled JS plugins must use the `jsPlugin(name, packageName)` helper in `index.mjs`, which resolves their absolute paths relative to this package rather than the consumer config.

Development
-----------

```bash
bun install
bun run test
bun run lint
```

The dependency-free self-check runs Oxlint against bad and clean fixtures, checking exit codes and structured diagnostics. `oxlint.config.ts` consumes this package's default export locally. The npm payload is `index.mjs`, `package.json`, and this README (plus any future license file).

Releases
--------

Work on `develop`; `main` holds releases. Git-flow uses `feature/`, `release/`, `hotfix/`, and `support/` prefixes and unprefixed version tags. Start at `0.0.0`; the first real release can be `0.1.0`:

```bash
bun pm version --no-git-tag-version minor
# Subsequent releases: bun pm version --no-git-tag-version patch|minor|major
```

As in `eslint-config-default`, `postversion` runs exactly:

```sh
git commit -m "Bump package version to $npm_package_version" package.json; git flow release start $npm_package_version; git flow release finish -m $npm_package_version $npm_package_version; git checkout develop; git merge main
```

This performs the git-flow release and returns to `develop`; it does not publish to npm or push. The reference package's README and CLAUDE.md do not document an npm publish command, and its package.json has no publish script. No automated publishing is added here. `publishConfig.access` is `public` for a future explicit npm release.
