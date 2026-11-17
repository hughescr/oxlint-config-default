import { createRequire } from 'node:module';
import * as rules from './rules.mjs';

/**
 * @typedef {import('oxlint').OxlintConfig} Config
 * @typedef {Config & { settings: NonNullable<Config['settings']> }} SettingsConfig
 */
const require = createRequire(import.meta.url);
const jsPlugin = (name, packageName) => ({ name, specifier: require.resolve(packageName) });
const categories = Object.fromEntries(['correctness', 'suspicious', 'pedantic', 'perf', 'style', 'restriction', 'nursery'].map(name => [name, 'off']));
const typescriptFiles = ['**/*.ts', '**/*.tsx', '**/*.cts', '**/*.mts'];
const testFiles = ['**/*.{test,spec}.{js,cjs,mjs,jsx,ts,cts,mts,tsx}'];
const sourceFiles = ['**/*.{js,cjs,mjs,jsx,ts,cts,mts,tsx}'];

// Oxlint does not inherit root `env`, `globals`, `ignorePatterns` or `settings` from an extended object, but it
// does inherit `env` and `globals` set inside `overrides`, so the default delivers env that way (see README).
const env = { builtin: true, node: true, es2024: true };

/**
 * Fields Oxlint reads only at the config root. Spread this into the consumer's root config and merge settings:
 * `{ ...root, extends: [config], settings: { ...root.settings, ...bunTest.settings } }`. The default already
 * delivers `env` through an inherited override, so `settings` is the field that needs this; `env` is repeated
 * here so the root applies it too.
 * @type {Required<Pick<Config, 'env' | 'settings'>>}
 */
export const root = { env, settings: {} };

/** Optional lodash and lodash-es rules. @type {Config} */
export const lodash = {
    jsPlugins: [jsPlugin('lodash', './plugins/lodash-oxlint.mjs'), jsPlugin('lodash-es', 'eslint-plugin-lodash-es')],
    rules: rules.lodash,
};

/**
 * Declares the native `@hughescr/oxlint-plugin-module-boundaries` jsPlugin (no TypeScript program, no settings)
 * and enables its two generic barrel rules, which the default already includes. The two policy rules
 * (`dependencies`, `no-cross-module-internal`) need a project policy: use `defineBoundaries`.
 * @type {Required<Pick<Config, 'jsPlugins' | 'rules'>>}
 */
export const moduleBoundaries = {
    jsPlugins: [jsPlugin('@hughescr/module-boundaries', '@hughescr/oxlint-plugin-module-boundaries')],
    rules: rules.moduleBoundaries,
};

/** Bun test recognition for rules whose native counterparts ignore bun:test imports. @type {SettingsConfig} */
export const bunTest = {
    plugins: ['jest'],
    jsPlugins: [jsPlugin('jest-js', 'eslint-plugin-jest')],
    settings: { jest: { version: 29, globalPackage: 'bun:test' } },
    overrides: [{
        files: testFiles,
        rules: {
            'jest-js/expect-expect': ['error', { assertFunctionNames: ['expect'] }],
            'jest-js/no-disabled-tests': 'error',
            'jest-js/no-done-callback': 'error',
            'jest-js/no-duplicate-hooks': 'error',
            'jest-js/no-focused-tests': 'error',
            'jest-js/no-standalone-expect': 'error',
            'jest-js/prefer-hooks-on-top': 'error',
            'jest-js/valid-expect': ['error', { alwaysAwait: false, asyncMatchers: ['toReject', 'toResolve'], minArgs: 1, maxArgs: 2 }],
            'jest/no-commented-out-tests': 'error',
            'jest/prefer-hooks-in-order': 'error',
            'jest/prefer-jest-mocked': 'warn',
            'jest/prefer-spy-on': 'warn',
        },
    }],
};

/**
 * Validates a project's module policy and returns the Oxlint fragment to `extends`: the plugin's jsPlugins entry plus
 * an override enabling `dependencies` and `no-cross-module-internal` with the policy as rule options (no `settings`,
 * any working directory). This is `@hughescr/oxlint-plugin-module-boundaries`' own `defineBoundaries`, re-exported so
 * a policy file imports it from this package: the fragment then registers the same plugin copy, under the same name
 * and absolute specifier, as the default config. Importing it from a second installed copy of the plugin makes
 * Oxlint refuse the config ("Plugin name ... is already registered").
 */
export { defineBoundaries } from '@hughescr/oxlint-plugin-module-boundaries';

/** @type {Config} */
const config = {
    categories,
    plugins: ['typescript', 'unicorn', 'import', 'node', 'promise', 'oxc'],
    // Options inherit through `extends` field by field; a consumer's own value wins.
    options: { typeAware: true, reportUnusedDisableDirectives: 'warn' },
    jsPlugins: [
        // Native plugin names are reserved, so leftover ESLint rules use aliases.
        jsPlugin('eslint-core', './plugins/eslint-core.mjs'),
        jsPlugin('unicorn-js', 'eslint-plugin-unicorn'),
        jsPlugin('import-x-js', 'eslint-plugin-import-x'),
        jsPlugin('n-js', 'eslint-plugin-n'),
        jsPlugin('regexp', 'eslint-plugin-regexp'),
        jsPlugin('@stylistic', '@stylistic/eslint-plugin'),
        jsPlugin('@hughescr/test-hygiene', '@hughescr/eslint-plugin-test-hygiene'),
        ...moduleBoundaries.jsPlugins,
    ],
    rules: {
        ...rules.core,
        ...rules.node,
        ...rules.nodeJs,
        ...rules.promise,
        ...rules.unicorn,
        ...rules.unicornJs,
        ...rules.imports,
        ...rules.importsJs,
        ...rules.eslintCore,
        ...rules.regexp,
        ...rules.stylistic,
        ...rules.testHygiene,
        ...moduleBoundaries.rules,
    },
    overrides: [
        // `env` at the root does not inherit through `extends`, but inside an override it does.
        { files: sourceFiles, env },
        { files: typescriptFiles, rules: rules.typescript },
        // All-language test relaxations must not accidentally enable TS rules on JS tests.
        { files: testFiles, rules: rules.tests },
    ],
};
export default config;
