// Loads eslint-plugin-sonarjs under Oxlint with its per-file import cache cleared once per file.
//
// Why: Oxlint 1.94.0 gives every linted file the SAME `context.sourceCode` object. eslint-plugin-sonarjs 4.2.2
// caches the current file's import data keyed by that object's identity (cjs/helpers/module.js) and never
// clears it, so rules gated on "is a test framework imported" (all the test-semantic rules) go silent or fire
// wrongly depending on which file was linted first, and in a different order from run to run when threads > 1.
// Measured on the stock plugin: wrong in 4 of 6 runs; with this wrapper: 6 of 6 correct.
//
// Pinned-version caveat: this reaches into an internal module (`cjs/helpers/module.js`, `clearFileCaches`) that
// is not public API, which is why package.json pins eslint-plugin-sonarjs to the exact version it was verified
// with. Re-verify (the self-check runs the repeat-run test) before bumping it.
//
// The mechanism is isolated in `resetPerFileState` so it can be swapped (for example for a generic per-file
// identity wrapper shared by all plugins) without touching anything else.
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const upstream = require('eslint-plugin-sonarjs');
const { clearFileCaches } = require(path.join(path.dirname(require.resolve('eslint-plugin-sonarjs')), 'helpers/module.js'));

let lastFile;
let lastText;
/** Clear the plugin's per-file caches the first time any rule is created for a new file (or new text of the same file). */
const resetPerFileState = context => {
    const filename = context.filename ?? context.getFilename();
    const text = context.sourceCode.text;
    if (filename === lastFile && text === lastText) { return; }
    lastFile = filename;
    lastText = text;
    clearFileCaches();
};

const wrap = rule => ({
    ...rule,
    create(context) {
        resetPerFileState(context);
        return rule.create(context);
    },
});

export default {
    meta: upstream.meta,
    rules: Object.fromEntries(Object.entries(upstream.rules).map(([name, rule]) => [name, wrap(rule)])),
};
