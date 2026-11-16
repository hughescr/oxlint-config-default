import { createRequire } from 'node:module';
import * as rules from './rules.mjs';

const require = createRequire(import.meta.url);
const jsPlugin = (name, packageName) => ({ name, specifier: require.resolve(packageName) });
const categories = Object.fromEntries(['correctness', 'suspicious', 'pedantic', 'perf', 'style', 'restriction', 'nursery'].map(name => [name, 'off']));
const typescriptFiles = ['**/*.ts', '**/*.tsx', '**/*.cts', '**/*.mts'];
const testFiles = ['**/*.{test,spec}.{js,cjs,mjs,jsx,ts,cts,mts,tsx}'];

/** Expensive syntax-only and degraded SonarJS rules; also included in the default. */
export const sonarjs = {
    jsPlugins: [jsPlugin('sonarjs', 'eslint-plugin-sonarjs')],
    rules: rules.sonarjs,
};

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
    plugins: ['typescript', 'unicorn', 'import', 'node', 'promise'],
    env: { builtin: true, node: true, es2024: true },
    options: { typeAware: true },
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
        { files: typescriptFiles, rules: rules.typescript },
        // All-language test relaxations must not accidentally enable TS rules on JS tests.
        { files: testFiles, rules: rules.tests },
    ],
};
