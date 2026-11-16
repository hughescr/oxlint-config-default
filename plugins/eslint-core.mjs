// Runs ESLint core rules that Oxlint lacks (no built-in version) through Oxlint's JS-plugin API.
// Rules receive no TypeScript type information (none of these need it).
import { builtinRules } from 'eslint/use-at-your-own-risk';

const NAMES = ['no-restricted-syntax', 'require-atomic-updates', 'strict', 'no-octal', 'dot-notation', 'no-dupe-args'];
export default {
    meta: { name: 'eslint-core' },
    rules: Object.fromEntries(NAMES.map(n => [n, builtinRules.get(n)])),
};
