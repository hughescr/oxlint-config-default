import { spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
// Adjacent declarations otherwise win module resolution over imported .mjs source on later builds.
// Remove only these generated outputs, never source files, before compiling all three modules.
for (const name of ['index', 'package-json', 'rules']) {
    rmSync(new URL(`${name}.d.mts`, import.meta.url), { force: true });
}
const result = spawnSync(process.execPath, ['node_modules/tsrs/bin/tsrs', '-p', 'tsconfig.types.json'], {
    cwd: root,
    stdio: 'inherit',
});
if (result.error) { throw result.error; }
process.exit(result.status ?? 1);
