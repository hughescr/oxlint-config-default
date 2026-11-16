import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const packageRoot = process.env.TEST_PACKAGE_ROOT ?? root;
const cli = join(root, 'node_modules/oxlint/bin/oxlint');
const consumer = mkdtempSync(join(tmpdir(), 'oxlint-config-consumer-'));
const started = performance.now();
function put(name, text) {
    const filename = join(consumer, name);
    mkdirSync(join(filename, '..'), { recursive: true });
    writeFileSync(filename, text);
}
function lint(files, extra = []) {
    const result = spawnSync('node', [cli, '-c', 'oxlint.config.ts', '--format', 'json', ...extra, ...files], {
        cwd: consumer, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024,
        env: { ...process.env, PATH: `${join(consumer, 'node_modules/.bin')}:${process.env.PATH}` },
    });
    assert.ifError(result.error);
    assert.doesNotMatch(result.stdout + result.stderr, /Error running JS plugin|Failed to load|Failed to parse (?:oxlint )?configuration/iu);
    assert.ok(result.status === 0 || result.status === 1, result.stdout + result.stderr);
    let parsed;
    try { parsed = JSON.parse(result.stdout); } catch { assert.fail(result.stdout + result.stderr); }
    return { ...result, diagnostics: parsed.diagnostics };
}
function has(result, code) {
    assert.ok(result.diagnostics.some(diagnostic => diagnostic.code === code),
        `Missing ${code}; got ${result.diagnostics.map(diagnostic => diagnostic.code).join(', ')}\n${result.stderr}`);
}
try {
    mkdirSync(join(consumer, 'node_modules/@hughescr'), { recursive: true });
    // A local package symlink has the same resolution behavior as bun link, without a global link.
    symlinkSync(packageRoot, join(consumer, 'node_modules/@hughescr/oxlint-config-default'));
    symlinkSync(join(root, 'node_modules/oxlint'), join(consumer, 'node_modules/oxlint'));
    symlinkSync(join(root, 'node_modules/tsrs'), join(consumer, 'node_modules/tsrs'));
    mkdirSync(join(consumer, 'node_modules/.bin'));
    symlinkSync(join(root, 'node_modules/tsrs/bin/tsrs-lint'), join(consumer, 'node_modules/.bin/tsrs-lint'));
    put('package.json', JSON.stringify({ name: 'config-consumer', type: 'module', private: true }));
    put('tsconfig.json', JSON.stringify({ compilerOptions: { strict: true, target: 'ESNext', module: 'ESNext', moduleResolution: 'Bundler' }, include: ['**/*.ts'] }));
    put('oxlint.config.ts', `import config, { lodash, bunTest } from '@hughescr/oxlint-config-default';
import { defineConfig } from 'oxlint';
export default defineConfig({ extends: [config, lodash, bunTest], settings: bunTest.settings });\n`);
    put('contracts.mjs', `import assert from 'node:assert/strict';
import { isAbsolute } from 'node:path';
import config, { sonarjs, lodash, bunTest, moduleBoundaries } from '@hughescr/oxlint-config-default';
assert.ok(Object.values(config.categories).every(level => level === 'off'));
for (const block of [config, sonarjs, lodash, bunTest, moduleBoundaries]) {
    assert.ok(block.jsPlugins.every(plugin => isAbsolute(plugin.specifier)));
}
const silent = 'deprecation no-ignored-return null-dereference no-selector-parameter index-of-compare-to-positive-number post-message no-array-delete no-alphabetical-sort new-operator-misuse different-types-comparison no-associative-arrays void-use argument-type in-operator-type-error array-callback-without-return function-return-type no-misleading-array-reverse no-useless-intersection no-in-misuse no-try-promise disabled-resource-integrity unused-named-groups existing-groups jsx-no-leaked-render prefer-regexp-exec prefer-read-only-props no-async-constructor'.split(' ');
for (const name of silent) { assert.equal(sonarjs.rules['sonarjs/' + name], undefined); }
for (const name of ['strict', 'n-js/no-unpublished-bin', 'n-js/process-exit-as-throw', 'eslint-core/no-restricted-syntax']) {
    assert.equal(config.rules[name], undefined);
}
`);
    const contract = spawnSync('node', ['contracts.mjs'], { cwd: consumer, encoding: 'utf8' });
    assert.ifError(contract.error);
    assert.equal(contract.status, 0, contract.stdout + contract.stderr);
    put('bad.ts', `import { value } from './dep.ts';
import { value as again } from './dep.ts';
import { readFileSync } from 'node:fs';
export const expression = /[aaa]/;
export const items: Array<string> = [];
/** @deprecated use current instead */
export function oldThing() { return 1; }
export const legacy = oldThing();
export const sortedNumbers = [3, 1, 2].sort();
export const sortedStrings = ['b', 'a'].sort();
export const title = "double";
export const json = JSON.parse('{}');
export const numbers = [1, 2].reduce((sum, number) => sum + number);
export const exists = !!value;
export function callback(cb: (error: unknown) => void) { cb('error'); }
export function exit() { process.exit(1); }
export function invalid() { debugger; }
export async function floating() { Promise.resolve(again); }
Promise.resolve(1).then(() => {});
for (let i = 0; i < items.length; i++) { console.log(items[i]); }
readFileSync('test');
`);
    put('dep.ts', 'export const value = 1;\n');
    put('bad.mjs', `export let counter = 0;
export async function increment() { counter += await Promise.resolve(1); }
export const value = { answer: 42 }['answer'];
`);
    put('bad.test.ts', `import { it, expect, jest } from 'bun:test';
it.only('empty', () => {});
it('timer', () => { jest.useFakeTimers(); expect(true).toBe(true); });
beforeEach(() => {});
beforeAll(() => {});\n`);
    put('index.ts', `export { privateValue } from './internal.ts';\n`);
    put('internal.ts', '/** @internal */\nexport const privateValue = 1;\n');
    put('lodash.ts', `import _ from 'lodash';\nexport const alias = _.first([1, 2]);\n`);
    const result = lint(['bad.ts', 'bad.mjs', 'bad.test.ts', 'index.ts', 'lodash.ts']);
    for(const code of [
        'eslint(no-debugger)', 'typescript(array-type)', 'typescript(no-floating-promises)',
        'typescript(no-deprecated)', 'typescript(require-array-sort-compare)',
        'unicorn(no-process-exit)', 'unicorn-js(no-for-loop)',
        'import(no-duplicates)', 'import-x-js(order)', 'node(no-sync)', 'n-js(no-process-exit)',
        'promise(always-return)', 'eslint-core(require-atomic-updates)', 'sonarjs(reduce-initial-value)',
        'regexp(no-dupe-characters-character-class)', '@stylistic(quotes)',
        '@hughescr/test-hygiene(require-fake-timers-cleanup)', '@hughescr/module-boundaries(no-internal-in-barrel)',
        'lodash(preferred-alias)', 'lodash-es(suggest-native-alternatives)', 'jest-js(no-focused-tests)',
        'jest(prefer-hooks-in-order)',
    ]) { has(result, code); }
    assert.equal(result.diagnostics.filter(diagnostic => diagnostic.code === 'typescript(require-array-sort-compare)').length, 2);
    put('comments.ts', '// eslint-enable no-console -- unmatched enable\nexport const answer = 42;\n');
    has(lint(['comments.ts']), '@eslint-community/eslint-comments(no-unused-enable)');
    put('clean.ts', 'export const answer = 42;\n');
    const clean = lint(['clean.ts'], ['--deny-warnings']);
    assert.equal(clean.status, 0, clean.stdout + clean.stderr);
    assert.deepEqual(clean.diagnostics, []);
    // Default-only extension proves the main rule sources do not depend on optional exports.
    put('oxlint.config.ts', `import config from '@hughescr/oxlint-config-default';
export default { extends: [config] };\n`);
    const base = lint(['bad.ts', 'bad.mjs', 'bad.test.ts', 'index.ts']);
    has(base, 'typescript(no-floating-promises)'); // No --type-aware flag: inherited option must work.
    has(base, 'eslint-core(dot-notation)'); // JS path only.
    assert.ok(!base.diagnostics.some(diagnostic => diagnostic.filename.endsWith('bad.test.ts') && diagnostic.code === 'eslint(no-empty-function)'));
    assert.ok(!base.diagnostics.some(diagnostic => diagnostic.code.startsWith('jest')));
    put('warning.ts', 'export const answer = 42;\nconsole.log(answer);\n');
    const warning = lint(['warning.ts']);
    assert.equal(warning.status, 0, warning.stdout + warning.stderr);
    assert.ok(warning.diagnostics.length > 0);
    assert.ok(warning.diagnostics.every(diagnostic => diagnostic.severity === 'warning'));
    assert.equal(lint(['warning.ts'], ['--deny-warnings']).status, 1);
    put('unused.ts', '// eslint-disable-next-line no-debugger -- intentionally unused\nexport const answer = 42;\n');
    // Unused directive reporting, unlike typeAware, is a root-only option.
    put('oxlint.config.ts', `import config from '@hughescr/oxlint-config-default';
export default { extends: [config], options: { reportUnusedDisableDirectives: 'warn' } };\n`);
    assert.ok(lint(['unused.ts']).diagnostics.some(diagnostic => /unused/iu.test(diagnostic.message)));
    has(lint(['bad.ts']), 'typescript(no-floating-promises)');
    put('a/internal.ts', '/** @internal */\nexport const privateValue = 1;\n');
    put('b/use.ts', "import { privateValue } from '../a/internal';\nexport const answer = privateValue;\n");
    put('oxlint.config.ts', `import { moduleBoundaries } from '@hughescr/oxlint-config-default';
export default { categories: { correctness: 'off' }, extends: [moduleBoundaries], rules: {
'@hughescr/module-boundaries/no-cross-module-internal': ['error', { modules: [
{ type: 'a', pattern: 'a/**' }, { type: 'b', pattern: 'b/**' }] }] } };\n`);
    has(lint(['b/use.ts']), '@hughescr/module-boundaries(no-cross-module-internal)');
    put('oxlint.config.ts', `import { sonarjs } from '@hughescr/oxlint-config-default';
export default { categories: { correctness: 'off' }, extends: [sonarjs] };\n`);
    has(lint(['bad.ts']), 'sonarjs(reduce-initial-value)');
    // A narrow imported override distinguishes consumer-relative matching from matching
    // against the module directory (broad **/*.ts globs alone cannot prove the anchor).
    put('node_modules/shared-override-probe/package.json', '{"type":"module","exports":"./index.mjs"}');
    put('node_modules/shared-override-probe/index.mjs', `export default { overrides: [
{ files: ['inside/*.mjs'], rules: { 'no-debugger': 'error' } }] };\n`);
    put('inside/hit.mjs', 'debugger;\n');
    put('outside/miss.mjs', 'debugger;\n');
    put('oxlint.config.ts', `import shared from 'shared-override-probe';
export default { categories: { correctness: 'off' }, extends: [shared] };\n`);
    const narrow = lint(['inside/hit.mjs', 'outside/miss.mjs']);
    assert.equal(narrow.diagnostics.length, 1, narrow.stdout + narrow.stderr);
    assert.ok(narrow.diagnostics[0].filename.endsWith('inside/hit.mjs'));
    has(narrow, 'eslint(no-debugger)');
    const astGrep = spawnSync('ast-grep', ['--version'], { encoding: 'utf8' });
    if(astGrep.error?.code === 'ENOENT') {
        console.log('SKIP ast-grep checks: ast-grep is not on PATH.');
    } else {
        assert.equal(astGrep.status, 0, astGrep.stderr);
        for(const extension of ['ts', 'js', 'tsx']) {
            put(`directives.${extension}`, '// eslint-disable\n// oxlint-disable-next-line no-console\n/* eslint-disable no-console -- */\n// eslint-disable-next-line no-console -- useful reason\n');
            for(const [rule, expected] of [['eslint-disable-bare', 1], ['eslint-disable-needs-description', 3]]) {
                const scan = spawnSync('ast-grep', ['scan', '--rule', join(packageRoot, 'ast-grep', `${rule}.yml`), '--json=compact', `directives.${extension}`], { cwd: consumer, encoding: 'utf8' });
                assert.ifError(scan.error);
                assert.ok(scan.status === 0 || scan.status === 1, scan.stderr);
                assert.equal(JSON.parse(scan.stdout).length, expected, scan.stdout + scan.stderr);
            }
        }
        console.log('ast-grep directive checks passed (TypeScript, JavaScript, TSX).');
    }
    console.log(`Consumer integration passed (${((performance.now() - started) / 1000).toFixed(2)}s).`);
} finally {
    if(process.env.KEEP_CONSUMER) { console.log(consumer); } else { rmSync(consumer, { recursive: true, force: true }); }
}
