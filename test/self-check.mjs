import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const cli = fileURLToPath(new URL('../node_modules/oxlint/bin/oxlint', import.meta.url));

for(const [fixture, expectedStatus] of [['bad.js', 1], ['clean.js', 0]]) {
    const result = spawnSync(process.execPath, [cli, '-c', 'oxlint.config.ts', '--format', 'json', `test/fixtures/${fixture}`], {
        cwd: root,
        encoding: 'utf8',
    });
    assert.ifError(result.error);
    const output = result.stdout + result.stderr;
    assert.equal(result.status, expectedStatus, output);
    const { diagnostics } = JSON.parse(result.stdout);
    if(expectedStatus === 1) {
        assert.equal(diagnostics.length, 1, output);
        assert.equal(diagnostics[0].code, 'eslint(no-debugger)');
        assert.equal(diagnostics[0].severity, 'error');
    } else {
        assert.deepEqual(diagnostics, [], output);
    }
    console.log(`${fixture}: exit ${result.status} (expected ${expectedStatus})`);
}
