import { defineConfig } from 'oxlint';

// Package maintenance uses native correctness checks. The distributed rule data and
// compatibility wrappers are exercised through consumer configs by the integration suite.
export default defineConfig({
    categories: { correctness: 'error', suspicious: 'warn' },
    plugins: ['unicorn', 'node', 'import', 'promise'],
    env: { node: true },
    rules: { 'no-unused-vars': 'error', 'no-debugger': 'error' },
});
