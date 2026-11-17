import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, rmSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { isAbsolute, join } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const packageRoot = process.env.TEST_PACKAGE_ROOT ?? root;
const cli = join(root, 'node_modules/oxlint/bin/oxlint');
const consumer = mkdtempSync(join(tmpdir(), 'oxlint-config-consumer-'));
const started = performance.now();
const pkg = await import(pathToFileURL(join(packageRoot, 'index.mjs')).href);
const data = await import(pathToFileURL(join(packageRoot, 'rules.mjs')).href);
const sonarPlugin = createRequire(join(packageRoot, 'index.mjs'))('eslint-plugin-sonarjs');
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
// Samples for the ported sonarjs ast-grep rules: every bad construct once (JS variants drop the type annotations).
const sampleBad = types => `export function a(xs${types ? ': number[]' : ''}, m${types ? ': Map<string, number>' : ''}, s${types ? ': Set<number>' : ''}) {
  const t1 = xs.length >= 0;
  const t2 = m.size < 0;
  const t3 = 0 > s.size;
  return [t1, t2, t3, xs.reduce((a, b) => a + b), xs.reduceRight((a, b) => a + b)];
}
export function b(n${types ? ': number' : ''}) {
  for (let i = 0; i != n; i += 2) { void i; }
  for (let i = 0; i === n; i++) { void i; }
}
export function c(x${types ? ': number' : ''}) {
  switch (x) { case 1 || 2: return 1; case (3, 4): return 2; default: return 0; }
}
export function d() { let i = 0; i = i++; return i; }\n`;
const sampleGood = types => `export function a(xs${types ? ': number[]' : ''}, m${types ? ': Map<string, number>' : ''}) {
  return [xs.length > 0, m.size === 0, xs.reduce((a, b) => a + b, 0), xs.reduceRight((a, b) => a + b, 0)];
}
export function b(n${types ? ': number' : ''}) { for (let i = 0; i < n; i++) { void i; } }
export function c(x${types ? ': number' : ''}) { switch (x) { case 1: case 2: return 1; default: return 0; } }
export function d() { let i = 0; i++; return i; }\n`;
// Generic syntax bans moved from a consumer. `types` selects TypeScript/TSX or plain JavaScript text; line numbers
// are identical either way because every JS replacement keeps its TS counterpart's line.
const banCases = types => {
    const decl = (ts, js) => (types ? ts : js);
    const promiseVoid = types ? '<void>' : '';
    return {
        'no-silent-catch-undefined': {
            scope: 'source',
            message: "Silent .catch(() => undefined) swallows errors. Use .catch((err) => { logger.warn({ err }, '...'); }) instead.",
            lines: [2, 3, 4, 7],
            flagged: `${decl('declare const p: Promise<void>;', 'const p = Promise.resolve();')}
p.catch(() => undefined);
p.catch((err) => undefined);
p.then(() => 1).catch(async () => undefined);
p
    .catch(() =>
        undefined);
`,
            clean: `${decl('declare const p: Promise<void>;', 'const p = Promise.resolve();')}
${decl('declare const logger: { warn: (...args: unknown[]) => void };', 'const logger = { warn() {} };')}
p.catch((err) => { logger.warn({ err }, 'failed'); });
p.catch(() => null);
p.catch(() => { return undefined; });
p.catch(() => void 0);
p.then(() => undefined);
p.finally(() => undefined);
p.then(() => 1, () => undefined);
`,
        },
        'no-test-bun-sleep': {
            scope: 'test',
            message: "Don't use real Bun.sleep in tests — use jest.useFakeTimers() + jest.advanceTimersByTime(), await Promise.resolve()/drainMicrotasks() for microtask flushing, or a Promise.withResolvers() gate for deterministic ordering.",
            lines: [1, 2],
            flagged: 'await Bun.sleep(10);\nconst p = Bun.sleep(5);\nexport { p };\n',
            clean: `${decl('declare const other: { sleep: (n: number) => void };', 'const other = { sleep() {} };')}
other.sleep(1);
Bun.sleepSync(1);
const b = Bun.version;
export { b };
`,
        },
        'no-test-dynamic-await-import': {
            scope: 'test',
            message: "Don't use dynamic await import() in tests — use static imports at file scope and spyOn() to override module exports.",
            lines: [2, 5, 8, 9, 10],
            flagged: `${decl('declare const spec: string;', 'const spec = "x";')}
const a = await import('node:path');
export { a };
async function load() {
    return (await import('./x.ts')).default;
}
export { load };
const b = await import(spec)${decl(' as { x: string }', '')};
const c = await (import('x'));
const d = await import('y')${decl(' satisfies object', '')};
`,
            clean: `import * as path from 'node:path';
const lazy = import('node:path');
const wrapped = lazy.then(m => m.sep);
const all = await Promise.all([import('node:path')]);
const typed = (import('x'))${decl(' as Promise<unknown>', '')};
export { path, wrapped, all, typed };
`,
        },
        'no-test-process-next-tick': {
            scope: 'test',
            message: "Don't use process.nextTick in tests — use await Promise.resolve() for microtask flushing.",
            lines: [1, 2],
            flagged: 'process.nextTick(() => undefined);\nconst tick = process.nextTick;\nexport { tick };\n',
            clean: `${decl('declare const other: { nextTick: () => void };', 'const other = { nextTick() {} };')}
other.nextTick();
const env = process.env;
export { env };
`,
        },
        'no-test-promise-wrapped-set-timeout': {
            scope: 'test',
            message: "Don't wrap setTimeout in a Promise in tests — use await Promise.resolve() for microtask flushing or jest.useFakeTimers() + jest.advanceTimersByTime() for real delays.",
            lines: [1, 4],
            flagged: `const a = new Promise${promiseVoid}(resolve => setTimeout(resolve, 10));
const b = new Promise${promiseVoid}((resolve) => {
    void 0;
    setTimeout(() => {
        resolve();
    }, 5);
});
export { a, b };
`,
            clean: `const a = new Promise${promiseVoid}(resolve => resolve());
const b = new Map();
export { a, b };
`,
        },
        'no-test-queue-microtask': {
            scope: 'test',
            message: "Don't use queueMicrotask in tests — use await Promise.resolve() for microtask flushing.",
            lines: [1, 2],
            flagged: 'queueMicrotask(() => undefined);\nqueueMicrotask(() => {\n    void 0;\n});\n',
            clean: `${decl('declare const obj: { queueMicrotask: () => void };', 'const obj = { queueMicrotask() {} };')}
obj.queueMicrotask();
await Promise.resolve();
`,
        },
        'no-test-set-immediate': {
            scope: 'test',
            message: "Don't use real setImmediate in tests — use await Promise.resolve() for microtask flushing.",
            lines: [1, 2],
            flagged: 'setImmediate(() => undefined);\nconst a = setImmediate(() => {\n    void 0;\n});\nexport { a };\n',
            clean: `${decl('declare const obj: { setImmediate: () => void };', 'const obj = { setImmediate() {} };')}
obj.setImmediate();
clearImmediate(undefined);
`,
        },
        'no-test-set-interval': {
            scope: 'test',
            message: "Don't use real setInterval in tests — use jest.useFakeTimers() + jest.advanceTimersByTime().",
            lines: [1, 3],
            flagged: 'const a = setInterval(() => undefined, 10);\nclearInterval(a);\nsetInterval(() => {\n    void 0;\n}, 5);\n',
            clean: `${decl('declare const obj: { setInterval: (n: number) => void };', 'const obj = { setInterval() {} };')}
obj.setInterval(1);
clearInterval(undefined);
`,
        },
        'no-test-set-timeout': {
            scope: 'test',
            message: "Don't use real setTimeout in tests — use jest.useFakeTimers() + jest.advanceTimersByTime().",
            lines: [1, 2],
            flagged: 'setTimeout(() => undefined, 10);\nsetTimeout(() => {\n    void 0;\n}, 0);\n',
            clean: `${decl('declare const obj: { setTimeout: (n: number) => void };', 'const obj = { setTimeout() {} };')}
obj.setTimeout(1);
globalThis.setTimeout(() => undefined, 1);
const setTimeoutName = 'setTimeout';
export { setTimeoutName };
`,
        },
    };
};
// Conventional test locations: directories named tests/test/__tests__ at any depth and *.test.* / *.spec.* files.
const testLocations = (id, extension) => [`tests/${id}/flagged.${extension}`, `tests/fixtures/${id}.${extension}`, `test/${id}.${extension}`, `__tests__/${id}.${extension}`, `packages/a/tests/${id}.${extension}`, `src/${id}.test.${extension}`, `src/${id}.spec.${extension}`];
const sourceLocations = (id, extension) => [`src/${id}/flagged.${extension}`, `lib/${id}.${extension}`, `scripts/${id}.${extension}`, `${id}.${extension}`, `contest/${id}.${extension}`, `latest/${id}.${extension}`];
const testGlobs = ['**/*.{test,spec}.{js,cjs,mjs,jsx,ts,cts,mts,tsx}'];
const sonarBlocks = { sonarjs: pkg.sonarjs, sonarjsAws: pkg.sonarjsAws, sonarjsWeb: pkg.sonarjsWeb, sonarjsFrameworks: pkg.sonarjsFrameworks, sonarjsTestTooling: pkg.sonarjsTestTooling, sonarjsStyle: pkg.sonarjsStyle };
const sonarName = key => (key.startsWith('sonarjs/') ? key.slice('sonarjs/'.length) : undefined);
const isOn = value => (Array.isArray(value) ? value[0] : value) !== 'off';
/** Enabled sonarjs rule names in a rules map. */
const onNames = rules => Object.entries(rules ?? {}).filter(([key, value]) => sonarName(key) && isOn(value)).map(([key]) => sonarName(key));
const blockNames = block => new Set([...onNames(block.rules), ...(block.overrides ?? []).flatMap(override => onNames(override.rules))]);

/** Contract checks that need no Oxlint run: exports, rule partition, scoping data, wrapper wiring, README coverage. */
function checkSonarContract() {
    // Every sonarjs block loads the plugin through the same reliability wrapper, never the stock plugin.
    for (const [name, block] of Object.entries(sonarBlocks)) {
        assert.ok(block, `missing export ${name}`);
        assert.equal(block.jsPlugins.length, 1, name);
        assert.equal(block.jsPlugins[0].name, 'sonarjs', name);
        assert.ok(isAbsolute(block.jsPlugins[0].specifier) && block.jsPlugins[0].specifier.endsWith('plugins/sonarjs-oxlint.mjs'), `${name} must use the wrapper: ${block.jsPlugins[0].specifier}`);
    }
    assert.ok(pkg.default.jsPlugins.some(plugin => plugin.name === 'sonarjs' && plugin.specifier === pkg.sonarjs.jsPlugins[0].specifier));
    const pluginRules = new Set(Object.keys(sonarPlugin.rules));
    const core = blockNames(pkg.sonarjs);
    assert.equal(core.size, 47, 'core is the 47 keep rules');
    // Scoping: general rules on non-test files, test-semantic rules on test files, four on both.
    const baseOn = new Set(onNames(pkg.sonarjs.rules));
    const testOverride = pkg.sonarjs.overrides.find(override => JSON.stringify(override.files) === JSON.stringify(testGlobs));
    assert.ok(testOverride, 'core has a test-file override using the package test globs');
    const testOn = new Set(onNames(testOverride.rules));
    const both = [...baseOn].filter(name => testOn.has(name)).toSorted();
    assert.deepEqual(both, ['hashing', 'no-identical-functions', 'no-internal-api-use', 'no-os-command-from-path']);
    assert.equal(baseOn.size, 38);
    assert.equal(testOn.size, 13);
    for (const name of baseOn) {
        if (!both.includes(name)) { assert.equal(testOverride.rules[`sonarjs/${name}`], 'off', `${name} must be off in test files`); }
    }
    for (const name of testOn) { assert.ok(!baseOn.has(name) || both.includes(name)); }
    // Opt-in groups: sizes, disjointness from the core and from each other, and existence in the plugin.
    const sizes = { sonarjsAws: 17, sonarjsWeb: 28, sonarjsFrameworks: 16, sonarjsTestTooling: 14, sonarjsStyle: 25 };
    const seen = new Map([...core].map(name => [name, 'sonarjs']));
    for (const [group, size] of Object.entries(sizes)) {
        const names = blockNames(sonarBlocks[group]);
        assert.equal(names.size, size, group);
        for (const name of names) {
            assert.ok(pluginRules.has(name), `${group}: ${name} is not a rule of the installed plugin`);
            assert.ok(!seen.has(name), `${name} is in both ${seen.get(name)} and ${group}`);
            seen.set(name, group);
        }
    }
    for (const name of core) { assert.ok(pluginRules.has(name), `core: ${name} is not a rule of the installed plugin`); }
    // Dropped rules: covered duplicates, not-covered, silent typed-only, ast-grep. None overlaps an enabled rule or another list.
    assert.equal(Object.keys(data.sonarjsCovered).length, 38 + 2 + 13, 'covered table: 38 duplicates + 2 enabled built-ins + 13 previously enabled regexp/native duplicates');
    assert.equal(data.sonarjsAstGrep.length, 5);
    assert.equal(data.sonarjsSilent.length, 27);
    assert.deepEqual(Object.keys(data.sonarjsNotCovered).toSorted(), ['label-position', 'no-duplicate-test-title', 'no-empty-test-title', 'no-labels', 'no-redundant-boolean', 'synchronous-suite-callback']);
    const dropped = new Map();
    for (const [list, names] of Object.entries({ covered: Object.keys(data.sonarjsCovered), notCovered: Object.keys(data.sonarjsNotCovered), silent: data.sonarjsSilent, astGrep: data.sonarjsAstGrep })) {
        for (const name of names) {
            assert.ok(pluginRules.has(name), `${list}: ${name} is not a rule of the installed plugin`);
            assert.ok(!seen.has(name), `${name} is both enabled (${seen.get(name)}) and dropped (${list})`);
            assert.ok(!dropped.has(name), `${name} is in both ${dropped.get(name)} and ${list}`);
            dropped.set(name, list);
        }
    }
    // The 31 rules the first consumer had to add by hand are each accounted for.
    for (const name of `assertions-in-test-cases async-test-assertions avoid-mutating-nested-properties-of-shallow-clones
        explicit-test-skip hooks-before-test-cases memoize-cache-key no-debounce-throttle-in-render
        no-debug-commands-in-ui-tests no-default-utility-imports no-duplicate-parameterized-test-case
        no-duplicate-test-title no-empty-parameterized-test-dataset no-empty-test-title
        no-fixed-wait-in-tests no-floating-point-equality no-forced-browser-interaction
        no-interpolation-in-inline-snapshots no-mutate-reactive-state-in-updated-hook no-trivial-assertions
        no-vue-class-component no-vue-mixins parameterized-tests prefer-cypress-should
        prefer-native-axios-alternative prefer-native-jquery-alternative prefer-native-lodash-alternative
        prefer-specific-assertions super-linear-regex testing-library-prefer-query-by-disappearance
        testing-library-query-assertion vitest-mock-at-module-scope`.split(/\s+/u)) {
        assert.ok(seen.has(name) || dropped.has(name), `${name} is silently missing`);
    }
    // Rules enabled by earlier versions of this package that are still enabled somewhere or documented as dropped.
    for (const name of ['no-commented-code', 'unused-import', 'bitwise-operators', 'sql-queries', 'slow-regex', 'os-command', 'arguments-order', 'no-redundant-optional', 'concise-regex']) {
        assert.ok(seen.has(name) || dropped.has(name), `${name} is silently missing`);
    }
    // Every "covered by" id must be a rule that is actually enabled by the default (or by bunTest, or an explicit compiler check).
    const enabledByDefault = new Set([pkg.default.rules, ...pkg.default.overrides.map(override => override.rules ?? {})].flatMap(map => Object.entries(map).filter(([, value]) => isOn(value)).map(([key]) => key)));
    assert.ok(!enabledByDefault.has('no-control-regex'), 'the stricter built-in is not enabled by default');
    assert.ok(blockNames(pkg.sonarjsStyle).has('no-control-regex'), 'SonarJS control regex checking is opt-in style');
    const enabledByBunTest = new Set(Object.keys(Object.assign({}, ...pkg.bunTest.overrides.map(override => override.rules))));
    for (const [name, covers] of Object.entries(data.sonarjsCovered)) {
        assert.ok(covers.length > 0, name);
        for (const id of covers) {
            if (id.startsWith('tsc:')) { continue; }
            const set = id.startsWith('bunTest:') ? enabledByBunTest : enabledByDefault;
            const rule = id.replace(/^bunTest:/u, '');
            assert.ok(set.has(rule), `sonarjs/${name} is listed as covered by ${id}, which is not enabled`);
        }
    }
    // Docs name every opt-in export and every dropped rule.
    const readme = readFileSync(join(packageRoot, 'README.md'), 'utf8');
    for (const name of [...Object.keys(sonarBlocks), 'root']) { assert.ok(readme.includes(`\`${name}\``), `README does not document ${name}`); }
    for (const name of [...Object.keys(data.sonarjsCovered), ...Object.keys(data.sonarjsNotCovered), ...data.sonarjsAstGrep]) {
        assert.ok(readme.includes(`sonarjs/${name}`), `README does not list dropped rule sonarjs/${name}`);
    }
}
checkSonarContract();
assert.ok(pkg.default.categories && Object.values(pkg.default.categories).every(level => level === 'off'));
assert.deepEqual(pkg.root.env, { builtin: true, node: true, es2024: true });
assert.deepEqual(pkg.root.settings, {});
assert.ok(!('env' in pkg.default), 'env does not inherit at the root; the default delivers it through an override');
assert.ok(pkg.default.overrides.some(override => override.env?.node === true));

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
    // `root` carries the fields Oxlint reads only at the config root; settings compose with bunTest's.
    put('oxlint.config.ts', `import config, { lodash, bunTest, root } from '@hughescr/oxlint-config-default';
import { defineConfig } from 'oxlint';
export default defineConfig({ ...root, extends: [config, lodash, bunTest], settings: { ...root.settings, ...bunTest.settings } });\n`);
    put('contracts.mjs', `import assert from 'node:assert/strict';
import { isAbsolute } from 'node:path';
import config, * as all from '@hughescr/oxlint-config-default';
assert.ok(Object.values(config.categories).every(level => level === 'off'));
for (const name of ['sonarjs', 'sonarjsAws', 'sonarjsWeb', 'sonarjsFrameworks', 'sonarjsTestTooling', 'sonarjsStyle', 'lodash', 'bunTest', 'moduleBoundaries']) {
    assert.ok(all[name].jsPlugins.every(plugin => isAbsolute(plugin.specifier)), name);
}
assert.ok(config.jsPlugins.every(plugin => isAbsolute(plugin.specifier)));
for (const name of ['sonarjs/deprecation', 'sonarjs/void-use', 'sonarjs/no-ignored-return', 'sonarjs/class-name', 'sonarjs/cors']) {
    assert.equal(config.rules[name], undefined, name);
}
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
export const sameSides = (n: number) => n % 2 === n % 2;
export const address = '8.8.8.8';
export const random = Math.random();
export function neverThrown() { new Error('not thrown'); }
export const controlCharacter = /\\x00/;
`);
    put('dep.ts', 'export const value = 1;\n');
    // bun:test files: test-semantic sonarjs rules apply here; general defect/security rules do not, except the four shared ones.
    put('trivial.test.ts', `import { it, expect } from 'bun:test';\nit('trivial', () => { expect(true).toBe(true); });\n`);
    put('scoped.test.ts', `import { it, expect } from 'bun:test';
import { createHash } from 'node:crypto';
it('scoping', () => { const ip = '8.8.8.8'; const r = Math.random(); expect(createHash('md5').update(String(r)).digest('hex') + ip).toBeString(); });\n`);
    put('env.mjs', 'export const cwd = process.cwd();\n');
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
    const result = lint(['bad.ts', 'bad.mjs', 'bad.test.ts', 'index.ts', 'lodash.ts', 'trivial.test.ts', 'scoped.test.ts', 'env.mjs']);
    const codesIn = file => result.diagnostics.filter(diagnostic => diagnostic.filename.endsWith(file)).map(diagnostic => diagnostic.code);
    assert.ok(codesIn('trivial.test.ts').includes('sonarjs(no-trivial-assertions)'), 'test-semantic sonarjs rule fires on test files');
    assert.ok(codesIn('scoped.test.ts').includes('sonarjs(hashing)'), 'the four shared sonarjs rules also run on test files');
    for (const code of ['sonarjs(no-hardcoded-ip)', 'sonarjs(pseudo-random)']) { assert.ok(!codesIn('scoped.test.ts').includes(code), `${code} must not run on test files`); }
    assert.ok(!codesIn('bad.ts').includes('sonarjs(no-trivial-assertions)'), 'test-semantic sonarjs rules do not run on non-test files');
    assert.ok(!codesIn('bad.ts').includes('eslint(no-control-regex)'), 'intentional control-character regexes are allowed by default');
    assert.ok(!codesIn('bad.ts').includes('sonarjs(no-control-regex)'), 'SonarJS control regex checking is opt-in');
    // `process` in a .mjs file: env reaches the config through the default's override, with no consumer env copy.
    assert.ok(!codesIn('env.mjs').includes('eslint(no-undef)'), 'node globals must not be reported as undefined');
    for(const code of [
        'eslint(no-debugger)', 'typescript(array-type)', 'typescript(no-floating-promises)',
        'typescript(no-deprecated)', 'typescript(require-array-sort-compare)',
        'unicorn(no-process-exit)', 'unicorn-js(no-for-loop)',
        'import(no-duplicates)', 'import-x-js(order)', 'node(no-sync)', 'n-js(no-process-exit)',
        'promise(always-return)', 'eslint-core(require-atomic-updates)', 'eslint(no-new)', 'oxc(missing-throw)',
        'sonarjs(no-identical-expressions)', 'sonarjs(no-hardcoded-ip)', 'sonarjs(pseudo-random)',
        'regexp(no-dupe-characters-character-class)', '@stylistic(quotes)',
        '@hughescr/test-hygiene(require-fake-timers-cleanup)', '@hughescr/module-boundaries(no-internal-in-barrel)',
        'lodash(preferred-alias)', 'lodash-es(suggest-native-alternatives)', 'jest-js(no-focused-tests)',
        'jest(prefer-hooks-in-order)',
    ]) { has(result, code); }
    assert.equal(result.diagnostics.filter(diagnostic => diagnostic.code === 'typescript(require-array-sort-compare)').length, 2);
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
    // Extending the default alone must already know Node globals (env arrives through an inherited override).
    assert.ok(!lint(['env.mjs']).diagnostics.some(diagnostic => diagnostic.code === 'eslint(no-undef)'));
    put('warning.ts', 'export const answer = 42;\nconsole.log(answer);\n');
    const warning = lint(['warning.ts']);
    assert.equal(warning.status, 0, warning.stdout + warning.stderr);
    assert.ok(warning.diagnostics.length > 0);
    assert.ok(warning.diagnostics.every(diagnostic => diagnostic.severity === 'warning'));
    assert.equal(lint(['warning.ts'], ['--deny-warnings']).status, 1);
    put('unused.ts', '// eslint-disable-next-line no-debugger -- intentionally unused\nexport const answer = 42;\n');
    // The default ships reportUnusedDisableDirectives: 'warn', so a consumer that extends it without setting the option gets the warning.
    put('oxlint.config.ts', `import config from '@hughescr/oxlint-config-default';
export default { extends: [config] };\n`);
    const unused = lint(['unused.ts']);
    assert.ok(unused.diagnostics.some(diagnostic => /unused/iu.test(diagnostic.message) && diagnostic.severity === 'warning'), 'default must warn on unused disable directives');
    // The consumer's own value wins over the inherited one.
    put('oxlint.config.ts', `import config from '@hughescr/oxlint-config-default';
export default { extends: [config], options: { reportUnusedDisableDirectives: 'off' } };\n`);
    assert.ok(!lint(['unused.ts']).diagnostics.some(diagnostic => /unused/iu.test(diagnostic.message)), 'consumer option must win over the default');
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
    has(lint(['bad.ts']), 'sonarjs(no-identical-expressions)');
    // Opt-in groups load through the same wrapper and fire on their own domains; none is part of the default.
    const optIns = [
        ['sonarjsAws', 'aws.ts', "import { aws_s3 as s3 } from 'aws-cdk-lib';\ndeclare const scope: any;\nnew s3.Bucket(scope, 'b', { publicReadAccess: true });\n", 'sonarjs(aws-s3-bucket-versioning)'],
        ['sonarjsWeb', 'web.ts', "import { exec } from 'node:child_process';\nexport function run(arg: string) { exec(`ls ${arg}`); }\n", 'sonarjs(os-command)'],
        ['sonarjsFrameworks', 'frameworks.jsx', 'export const grid = () => <table><tr><td>1</td></tr></table>;\n', 'sonarjs(table-header)'],
        ['sonarjsTestTooling', 'cypress.test.js', "describe('x', function () { it('y', function () { cy.get('x').debug(); cy.wait(500); }); });\n", 'sonarjs(no-fixed-wait-in-tests)'],
        ['sonarjsStyle', 'style.ts', 'export function f(x: number) { const y = x * 2; return y; }\n', 'sonarjs(prefer-immediate-return)'],
        ['sonarjsStyle', 'control.ts', 'export const control = /\\x01/;\n', 'sonarjs(no-control-regex)'],
    ];
    for (const [name, file, text, code] of optIns) {
        put(file, text);
        put('oxlint.config.ts', `import { ${name} } from '@hughescr/oxlint-config-default';\nexport default { categories: { correctness: 'off' }, extends: [${name}] };\n`);
        has(lint([file]), code);
        put('oxlint.config.ts', `import config from '@hughescr/oxlint-config-default';\nexport default { extends: [config] };\n`);
        assert.ok(!lint([file]).diagnostics.some(diagnostic => diagnostic.code === code), `${code} must not be in the default`);
    }
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
    // Which config fields Oxlint inherits from an extended object. The README documents exactly this table; a
    // changed Oxlint version that alters it must fail here so the docs and `root` are revisited.
    put('node_modules/root-field-probe/package.json', '{"type":"module","exports":"./index.mjs"}');
    put('node_modules/root-field-probe/plugin.mjs', `export default { meta: { name: 'probe' }, rules: { show: { create(context) { return { Program(node) { context.report({ node, message: 'settings=' + JSON.stringify(context.settings) }); } }; } } } };\n`);
    put('node_modules/root-field-probe/index.mjs', `import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
export default {
    env: { node: true },
    globals: { probeGlobal: 'readonly' },
    ignorePatterns: ['ignored/'],
    settings: { probeSetting: 1 },
    options: { reportUnusedDisableDirectives: 'warn' },
    jsPlugins: [{ name: 'probe', specifier: require.resolve('./plugin.mjs') }],
    rules: { 'no-undef': 'error', 'probe/show': 'warn' },
    overrides: [{ files: ['override-env/*.mjs'], env: { node: true }, globals: { overrideGlobal: 'readonly' } }],
};\n`);
    put('probe/a.mjs', 'export const x = [process.cwd(), probeGlobal];\n');
    put('ignored/b.mjs', 'export const y = process.cwd();\n');
    put('probe/unused.mjs', '// eslint-disable-next-line no-console -- unused\nexport const z = 1;\n');
    put('override-env/c.mjs', 'export const w = [process.cwd(), overrideGlobal];\n');
    put('oxlint.config.ts', `import probe from 'root-field-probe';\nexport default { categories: { correctness: 'off' }, extends: [probe] };\n`);
    const probed = lint(['probe/a.mjs', 'ignored/b.mjs', 'probe/unused.mjs', 'override-env/c.mjs']);
    const undefinedNames = file => probed.diagnostics.filter(diagnostic => diagnostic.filename.endsWith(file) && diagnostic.code === 'eslint(no-undef)').map(diagnostic => /'(\w+)'/u.exec(diagnostic.message)[1]);
    assert.deepEqual(undefinedNames('probe/a.mjs').toSorted(), ['probeGlobal', 'process'], 'root env and globals are NOT inherited');
    assert.ok(probed.diagnostics.some(diagnostic => diagnostic.filename.endsWith('ignored/b.mjs')), 'root ignorePatterns are NOT inherited');
    assert.ok(probed.diagnostics.some(diagnostic => diagnostic.message === 'settings={}'), 'root settings are NOT inherited');
    assert.deepEqual(undefinedNames('override-env/c.mjs'), [], 'env and globals set inside an override ARE inherited');
    assert.ok(probed.diagnostics.some(diagnostic => /unused eslint-disable/iu.test(diagnostic.message)), 'options such as reportUnusedDisableDirectives ARE inherited');
    // Spreading a root block into the consumer root applies them.
    put('oxlint.config.ts', `import probe from 'root-field-probe';\nexport default { categories: { correctness: 'off' }, extends: [probe], env: probe.env, globals: probe.globals, settings: probe.settings, ignorePatterns: probe.ignorePatterns };\n`);
    const applied = lint(['probe/a.mjs', 'ignored/b.mjs']);
    assert.deepEqual(applied.diagnostics.filter(diagnostic => diagnostic.code === 'eslint(no-undef)'), []);
    assert.ok(!applied.diagnostics.some(diagnostic => diagnostic.filename.endsWith('ignored/b.mjs')));
    assert.ok(applied.diagnostics.some(diagnostic => diagnostic.message === 'settings={"probeSetting":1}'));
    // Reliability: Oxlint 1.94 hands every file one shared `sourceCode`, and the stock sonarjs plugin caches
    // "which test framework is imported" per sourceCode identity, so a non-test file sorted first silences the
    // test-gated rules for the whole run (nondeterministically with threads). The wrapper clears the caches per
    // file; the test-gated rule must fire on every one of several default-thread runs.
    // The non-test files must exercise import-dependent rules (hashing, no-os-command-from-path) so the stock
    // plugin's cache is populated from a file without bun:test; with 19 such files around one test file the
    // stock plugin failed 12 of 12 runs when measured, so six runs are ample.
    for (const prefix of ['aaa', 'bbb', 'ccc', 'mmm', 'xxx', 'yyy', 'zzz']) {
        for (const index of [1, 2, 3]) {
            if (prefix === 'mmm' && index > 1) { continue; }
            put(`repeat/${prefix}-${index}.ts`, `import { createHash } from 'node:crypto';\nimport { execSync } from 'node:child_process';\nexport const hash${index} = createHash('sha256');\nexport const out${index} = execSync('ls');\n`);
        }
    }
    put('repeat/mid.test.ts', `import { it, expect } from 'bun:test';\nit('trivial', () => { expect(true).toBe(true); });\n`);
    // Optional `boundaries` add-on: two layers, one forbidden import (fires) and one allowed import (clean).
    // Elements resolve against the working directory (the consumer root), exactly like a real project.
    assert.ok(pkg.boundaries && typeof pkg.defineBoundaries === 'function', 'boundaries and defineBoundaries must be exported');
    assert.ok(isAbsolute(pkg.boundaries.jsPlugins[0].specifier) && pkg.boundaries.jsPlugins[0].name === 'boundaries', 'boundaries loads the plugin by absolute specifier');
    const resolverKeys = Object.keys(pkg.boundaries.settings['import/resolver']);
    assert.ok(resolverKeys.length === 1 && isAbsolute(resolverKeys[0]), 'the import resolver is addressed by absolute path so a strict installer cannot lose it');
    assert.equal(pkg.boundaries.rules, undefined, 'the bare add-on carries no project policy');
    const layerElements = [{ type: 'low', pattern: 'layers/low/**' }, { type: 'high', pattern: 'layers/high/**' }];
    const architecture = pkg.defineBoundaries({
        elements: layerElements,
        dependencies: { default: 'disallow', policies: [{ from: { element: { type: 'high' } }, allow: { to: { element: { type: ['low'] } } } }] },
        files: ['layers/**/*.ts'],
    });
    assert.deepEqual(architecture.settings['boundaries/elements'], layerElements);
    assert.deepEqual(architecture.jsPlugins, pkg.boundaries.jsPlugins);
    assert.equal(architecture.overrides.length, 1);
    assert.deepEqual(architecture.overrides[0].files, ['layers/**/*.ts']);
    assert.equal(architecture.overrides[0].rules['boundaries/dependencies'][0], 'error');
    put('layers/low/a.ts', 'export const lowValue = 1;\n');
    put('layers/high/b.ts', `import { lowValue } from '../low/a';\nexport const highValue = lowValue + 1;\n`);
    put('layers/low/c.ts', `import { highValue } from '../high/b';\nexport const forbidden = highValue;\n`);
    const architectureSource = `import { defineBoundaries } from '@hughescr/oxlint-config-default';
const architecture = defineBoundaries({
    elements: [{ type: 'low', pattern: 'layers/low/**' }, { type: 'high', pattern: 'layers/high/**' }],
    dependencies: { default: 'disallow', policies: [{ from: { element: { type: 'high' } }, allow: { to: { element: { type: ['low'] } } } }] },
    files: ['layers/**/*.ts'],
});\n`;
    // The boundaries add-on runs in the same repeated multi-file run as the sonarjs wrapper.
    put('oxlint.config.ts', `import { sonarjs } from '@hughescr/oxlint-config-default';
${architectureSource}export default { categories: { correctness: 'off' }, extends: [sonarjs, architecture], settings: { ...architecture.settings } };\n`);
    for (let run = 1; run <= 6; run++) {
        const repeated = lint(['repeat', 'layers']);
        assert.ok(repeated.diagnostics.some(diagnostic => diagnostic.code === 'sonarjs(no-trivial-assertions)' && diagnostic.filename.endsWith('mid.test.ts')), `run ${run}: test-gated sonarjs rule went silent`);
        const boundaryHits = repeated.diagnostics.filter(diagnostic => diagnostic.code === 'boundaries(dependencies)');
        assert.deepEqual(boundaryHits.map(diagnostic => diagnostic.filename), ['layers/low/c.ts'], `run ${run}: only the forbidden import may fire boundaries(dependencies)\n${repeated.stdout}${repeated.stderr}`);
    }
    // Settings do not inherit through `extends`, so omitting the root merge silences the rule (the README documents this).
    put('oxlint.config.ts', `${architectureSource}export default { categories: { correctness: 'off' }, extends: [architecture] };\n`);
    assert.ok(!lint(['layers']).diagnostics.some(diagnostic => diagnostic.code === 'boundaries(dependencies)'), 'without the root settings merge the rule has no elements to classify with');

    // `package-json` entry point: a minimal ESLint flat config that lints only package.json (Oxlint cannot).
    const eslintCli = join(root, 'node_modules/eslint/bin/eslint.js');
    put('eslint.package-json.config.mjs', `export { default } from '@hughescr/oxlint-config-default/package-json';\n`);
    const lintManifest = (name, manifest) => {
        put(`manifests/${name}/package.json`, typeof manifest === 'string' ? manifest : `${JSON.stringify(manifest, null, 2)}\n`);
        const run = spawnSync('node', [eslintCli, '-c', 'eslint.package-json.config.mjs', '--format', 'json', `manifests/${name}/package.json`], { cwd: consumer, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
        assert.ifError(run.error);
        assert.ok(run.status === 0 || run.status === 1, run.stdout + run.stderr);
        const report = JSON.parse(run.stdout);
        assert.equal(report.length, 1, run.stdout + run.stderr);
        return { status: run.status, rules: report[0].messages.map(message => message.ruleId), messages: report[0].messages };
    };
    const pjConfig = (await import(pathToFileURL(join(packageRoot, 'package-json.mjs')).href)).default;
    assert.ok(Array.isArray(pjConfig) && pjConfig.length > 0, 'package-json default export is a flat-config array');
    assert.ok(pjConfig.every(entry => entry.plugins === undefined || Object.keys(entry.plugins).every(plugin => plugin === 'package-json')), 'only the package-json plugin is loaded');
    assert.ok(!readFileSync(join(packageRoot, 'package-json.mjs'), 'utf8').includes('eslint-config-default'), 'package-json.mjs must not depend on the ESLint shared config');
    const publishable = { name: 'good-package', version: '1.0.0', description: 'A well formed package', license: 'MIT', author: 'A Person <a@example.com>', type: 'module', exports: './index.mjs', files: ['index.mjs'], sideEffects: false, repository: { type: 'git', url: 'git+https://github.com/example/good-package.git' }, dependencies: { a: '^1.0.0', b: '^1.0.0' } };
    const good = lintManifest('good', publishable);
    assert.deepEqual(good.rules, [], JSON.stringify(good.messages));
    assert.equal(good.status, 0);
    const bad = lintManifest('bad', { ...publishable, version: 'not-a-version', keywords: [], files: [], dependencies: { b: '^1.0.0', a: '^1.0.0' }, scripts: { z: 'echo z', a: 'echo a' }, description: undefined, repository: 'github:example/good-package' });
    assert.equal(bad.status, 1);
    for (const rule of ['sort-collections', 'valid-version', 'no-empty-fields', 'require-description', 'repository-shorthand']) { assert.ok(bad.rules.includes(`package-json/${rule}`), `missing package-json/${rule}; got ${bad.rules.join(', ')}`); }
    assert.equal(bad.messages.filter(message => message.ruleId === 'package-json/sort-collections').length, 2, 'dependencies and scripts are both checked');
    assert.equal(bad.messages.filter(message => message.ruleId === 'package-json/no-empty-fields').length, 1, 'the empty keywords array is flagged but the empty files array is allowed (ignoreProperties: files)');
    const invalidValue = lintManifest('invalid', { ...publishable, homepage: 5, bin: 5 });
    assert.ok(invalidValue.rules.includes('package-json/valid-homepage') && invalidValue.rules.includes('package-json/valid-bin'), invalidValue.rules.join(', '));
    // Private packages skip the attribution requirement (ignorePrivate); publishable ones do not.
    const privateNoAuthor = lintManifest('private', { name: 'app', version: '1.0.0', private: true, description: 'An app', type: 'module' });
    assert.deepEqual(privateNoAuthor.rules, [], JSON.stringify(privateNoAuthor.messages));
    assert.ok(lintManifest('public-no-author', { ...publishable, author: undefined }).rules.includes('package-json/require-attribution'));
    const duplicate = lintManifest('duplicate', `{ "name": "d", "version": "1.0.0", "private": true, "description": "d", "type": "module", "dependencies": { "a": "1.0.0", "a": "2.0.0" } }\n`);
    assert.ok(duplicate.rules.includes('package-json/unique-dependencies'), duplicate.rules.join(', '));

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
        // Policy fixtures are real comments, not a whole-file regex: strings/templates must stay inert.
        // The allowed header consists only of comments, whitespace and an optional hashbang; 'use strict' is code.
        const directiveCases = {
            'directive-block-disable-not-at-top': [
                ['/* eslint-disable no-debugger -- whole file */\ndebugger;\n', []],
                ['#!/usr/bin/env node\n\n/* licence */\n/** docblock */\n/// <reference path="types.d.ts" />\n/* oxlint-disable no-debugger -- whole file */\ndebugger;\n', []],
                ['/* licence */\n// another header\n/* eslint-disable no-debugger -- whole file */\n/* oxlint-disable no-console -- whole file */\ndebugger;\n', []],
                ['import "x";\n/* eslint-disable no-debugger -- late */\ndebugger;\n', [2]],
                ['function f() {\n/* oxlint-disable no-debugger -- scoped */\ndebugger;\n}\n', [2]],
                ['"use strict";\n// intervening comment\n/* eslint-disable no-debugger -- late */\ndebugger;\n', [3]],
                ['export const x = 1;\n// eslint-disable no-debugger -- late line-comment form\ndebugger;\n', [2]],
                ['// oxlint-disable no-debugger -- whole file\ndebugger;\n', []],
                ['const x = "/* eslint-disable no-debugger -- inert */";\nconst y = `// oxlint-disable no-debugger -- inert`;\n// eslint-disable-next-line no-debugger -- local\ndebugger; // oxlint-disable-line no-debugger -- local\n', []],
                ['function f() { /* header-looking comment */\n/* eslint-disable no-debugger -- not a file header */\n}\n', [2]],
                [';\n/* eslint-disable no-debugger -- empty statement is code */\n', [2]],
            ],
            'directive-no-enable': [
                ['/* eslint-enable no-debugger -- forbidden */\n// oxlint-enable no-debugger -- forbidden\n/* eslint-enable */\n', [1, 2, 3]],
                ['const x = "/* eslint-enable no-debugger */";\nconst y = `// oxlint-enable no-debugger`;\n// ordinary mention of eslint-enable\n/* eslint-disable-next-line no-debugger -- allowed */\ndebugger;\n', []],
            ],
            'directive-no-inline-config': [
                ['/* eslint no-debugger: off */\n/* global x */\n/* globals x, y */\n/* exported x */\n/* eslint-env node */\n// eslint no-debugger: off\n// global x\n', [1, 2, 3, 4, 5, 6, 7]],
                ['const x = "/* eslint no-debugger: off */";\nconst y = `/* global x */`;\n/* eslint-disable no-debugger -- allowed */\n// oxlint-disable-next-line no-debugger -- allowed\n// eslint-config is not a directive\n/* globalsAreOrdinaryWords */\n', []],
            ],
        };
        for (const extension of ['ts', 'mts', 'cts', 'js', 'mjs', 'cjs', 'jsx', 'tsx']) {
            for (const [rule, cases] of Object.entries(directiveCases)) {
                for (const [index, [text, expectedLines]] of cases.entries()) {
                    const file = `policy-${rule}-${index}.${extension}`;
                    put(file, text + (['jsx', 'tsx'].includes(extension) ? 'const element = <div />;\n' : ''));
                    const scan = spawnSync('ast-grep', ['scan', '--rule', join(packageRoot, 'ast-grep', `${rule}.yml`), '--json=compact', file], { cwd: consumer, encoding: 'utf8' });
                    assert.ifError(scan.error);
                    assert.ok(scan.status === 0 || scan.status === 1, scan.stderr);
                    assert.deepEqual(JSON.parse(scan.stdout).map(match => match.range.start.line + 1).toSorted((a, b) => a - b), expectedLines, `${rule} on ${file}: ${scan.stdout}${scan.stderr}`);
                }
            }
        }
        console.log('ast-grep directive checks passed (TypeScript, JavaScript/JSX, TSX; header-only disables, no enables/config).');
        // Ported sonarjs rules: the bad sample matches (expected counts), the good sample never does.
        const sonarCases = [['sonar-comma-or-logical-or-case', 2], ['sonar-no-collection-size-mischeck', 3], ['sonar-no-equals-in-for-termination', 2], ['sonar-no-useless-increment', 1], ['sonar-reduce-initial-value', 2]];
        for (const extension of ['ts', 'js', 'tsx']) {
            put(`sonar-bad.${extension}`, sampleBad(extension !== 'js'));
            put(`sonar-good.${extension}`, sampleGood(extension !== 'js'));
            for (const [rule, expected] of sonarCases) {
                for (const [sample, count] of [['bad', expected], ['good', 0]]) {
                    const scan = spawnSync('ast-grep', ['scan', '--rule', join(packageRoot, 'ast-grep', `${rule}.yml`), '--json=compact', `sonar-${sample}.${extension}`], { cwd: consumer, encoding: 'utf8' });
                    assert.ifError(scan.error);
                    assert.ok(scan.status === 0 || scan.status === 1, scan.stderr);
                    assert.equal(JSON.parse(scan.stdout).length, count, `${rule} on ${sample}.${extension}: ${scan.stdout}${scan.stderr}`);
                }
            }
        }
        console.log('ast-grep ported sonarjs checks passed (TypeScript, JavaScript, TSX).');
        // Generic syntax bans. Scanned through a real ruleDir (sgconfig.yml in a sub-project whose ruleDirs points at the
        // package's ast-grep directory, as a consumer's does): scoping comes from each rule's own files/ignores globs.
        put('ban-scan/sgconfig.yml', 'ruleDirs:\n  - ../node_modules/@hughescr/oxlint-config-default/ast-grep\n');
        const variants = [['ts', '', true], ['mts', '', true], ['cts', '', true], ['js', '-javascript', false], ['mjs', '-javascript', false], ['cjs', '-javascript', false], ['jsx', '-javascript', false], ['tsx', '-tsx', true]];
        const banIds = Object.keys(banCases(true));
        assert.equal(banIds.length, 9);
        const flaggedFiles = new Map();
        const silentFiles = new Set();
        for (const [extension, suffix, types] of variants) {
            for (const [id, ban] of Object.entries(banCases(types))) {
                const [inScope, outOfScope] = ban.scope === 'test' ? [testLocations, sourceLocations] : [sourceLocations, testLocations];
                for (const location of inScope(id, extension)) {
                    put(`ban-scan/${location}`, ban.flagged);
                    flaggedFiles.set(location, { ruleId: `${id}${suffix}`, ...ban });
                }
                for (const location of outOfScope(id, extension)) {
                    put(`ban-scan/${location}`, ban.flagged);
                    silentFiles.add(location);
                }
                const cleanLocation = ban.scope === 'test' ? `tests/${id}/clean.${extension}` : `src/${id}/clean.${extension}`;
                put(`ban-scan/${cleanLocation}`, ban.clean);
                silentFiles.add(cleanLocation);
            }
        }
        const banScan = spawnSync('ast-grep', ['scan', '--json=compact'], { cwd: join(consumer, 'ban-scan'), encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
        assert.ifError(banScan.error);
        assert.equal(banScan.status, 1, `the ban scan must report errors: ${banScan.stderr}`);
        const banMatches = JSON.parse(banScan.stdout);
        const isBan = ruleId => banIds.includes(ruleId.replace(/-(?:javascript|tsx)$/u, ''));
        for (const [location, expected] of flaggedFiles) {
            const own = banMatches.filter(match => match.file === location && match.ruleId === expected.ruleId);
            assert.deepEqual(own.map(match => match.range.start.line + 1).toSorted((a, b) => a - b), expected.lines, `${expected.ruleId} at ${location}`);
            assert.ok(own.every(match => match.message === expected.message), `${expected.ruleId} at ${location}: message`);
        }
        for (const match of banMatches.filter(entry => isBan(entry.ruleId))) {
            assert.ok(!silentFiles.has(match.file), `${match.ruleId} must stay silent at ${match.file}`);
            assert.ok(flaggedFiles.has(match.file), `${match.ruleId} matched unexpected file ${match.file}`);
        }
        // The README names every shipped ast-grep rule file.
        const astGrepReadme = readFileSync(join(packageRoot, 'README.md'), 'utf8');
        for (const file of readdirSync(join(packageRoot, 'ast-grep')).filter(name => name.endsWith('.yml'))) {
            assert.ok(astGrepReadme.includes(`\`${file}\``), `README does not list ast-grep/${file}`);
        }
        console.log('ast-grep generic ban checks passed (TypeScript, JavaScript, TSX; test and source scoping).');
    }
    console.log(`Consumer integration passed (${((performance.now() - started) / 1000).toFixed(2)}s).`);
} finally {
    if(process.env.KEEP_CONSUMER) { console.log(consumer); } else { rmSync(consumer, { recursive: true, force: true }); }
}
