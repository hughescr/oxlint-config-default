import { createRequire } from 'node:module';
import * as rules from './rules.mjs';

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
 */
export const root = { env, settings: {} };

// Every SonarJS block loads the plugin through the same wrapper that clears its per-file cache (see the wrapper).
const sonarjsPlugin = jsPlugin('sonarjs', './plugins/sonarjs-oxlint.mjs');
const sonarBlock = ({ rules: general, tests }) => ({
    jsPlugins: [sonarjsPlugin],
    rules: general,
    overrides: Object.keys(tests).length > 0 ? [{ files: testFiles, rules: tests }] : [],
});

/** SonarJS core: 47 reliable rules, scoped (general rules on non-test files, test-semantic rules on test files). Included in the default. */
export const sonarjs = sonarBlock(rules.sonarjs);
/** Opt-in: AWS CDK / infrastructure rules. */
export const sonarjsAws = sonarBlock(rules.sonarjsAws);
/** Opt-in: web server, cookie, header, HTTP library and general injection/secret security rules. */
export const sonarjsWeb = sonarBlock(rules.sonarjsWeb);
/** Opt-in: React, Vue, Angular, jQuery, axios, HTML and JSX rules. */
export const sonarjsFrameworks = sonarBlock(rules.sonarjsFrameworks);
/** Opt-in: chai, cypress, mocha, testing-library, vitest and other test-tool rules (test files). */
export const sonarjsTestTooling = sonarBlock(rules.sonarjsTestTooling);
/** Opt-in: style and low-value rules. */
export const sonarjsStyle = sonarBlock(rules.sonarjsStyle);

/** Optional lodash and lodash-es rules. */
export const lodash = {
    jsPlugins: [jsPlugin('lodash', './plugins/lodash-oxlint.mjs'), jsPlugin('lodash-es', 'eslint-plugin-lodash-es')],
    rules: rules.lodash,
};

/** Generic barrel rules are included by default. Add no-cross-module-internal with project options. */
export const moduleBoundaries = {
    jsPlugins: [jsPlugin('@hughescr/module-boundaries', './plugins/module-boundaries-oxlint.mjs')],
    rules: rules.moduleBoundaries,
};

/** Bun test recognition for rules whose native counterparts ignore bun:test imports. */
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
            'jest/no-commented-out-tests': 'error',
            'jest/prefer-hooks-in-order': 'error',
            'jest/prefer-jest-mocked': 'warn',
            'jest/prefer-spy-on': 'warn',
        },
    }],
};

export default {
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
        jsPlugin('@eslint-community/eslint-comments', './plugins/eslint-comments-oxlint.mjs'),
        jsPlugin('@hughescr/test-hygiene', '@hughescr/eslint-plugin-test-hygiene'),
        ...moduleBoundaries.jsPlugins,
        ...sonarjs.jsPlugins,
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
        ...rules.comments,
        ...rules.testHygiene,
        ...moduleBoundaries.rules,
        ...sonarjs.rules,
    },
    overrides: [
        // `env` at the root does not inherit through `extends`, but inside an override it does.
        { files: sourceFiles, env },
        ...sonarjs.overrides,
        { files: typescriptFiles, rules: rules.typescript },
        // All-language test relaxations must not accidentally enable TS rules on JS tests.
        { files: testFiles, rules: rules.tests },
    ],
};
