// Runs the UNMODIFIED @hughescr/eslint-plugin-module-boundaries rules under Oxlint by
// handing them a minimal stand-in for `sourceCode.parserServices.program`.  The rules only ever call
// `program.getCompilerOptions()` and `program.getSourceFile(file)` (ts.resolveModuleName + a parsed SourceFile
// for JSDoc `@internal` lookup) - no type checker, no symbols.  The shim reads the tsconfig itself and parses
// files with `ts.createSourceFile` (syntax only).
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import upstream from '@hughescr/eslint-plugin-module-boundaries';
import ts from 'typescript';

const programs = new Map();
const makeProgram = tsconfigPath => {
    if (programs.has(tsconfigPath)) return programs.get(tsconfigPath);
    const read = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
    const parsed = ts.parseJsonConfigFileContent(read.config, ts.sys, path.dirname(tsconfigPath));
    const sourceFiles = new Map();
    const program = {
        getCompilerOptions: () => parsed.options,
        getSourceFile(file) {
            if (!sourceFiles.has(file)) {
                sourceFiles.set(file, existsSync(file)
                    ? ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true)
                    : undefined);
            }
            return sourceFiles.get(file);
        },
    };
    programs.set(tsconfigPath, program);
    return program;
};

const wrap = rule => ({
    ...rule,
    create(context) {
        const tsconfig = context.settings?.['module-boundaries/tsconfig'] ?? 'tsconfig.json';
        const program = makeProgram(path.resolve(context.cwd, tsconfig));
        const sourceCode = new Proxy({}, {
            get: (_, prop) => (prop === 'parserServices' ? { program } : bind(context.sourceCode, prop)),
        });
        const proxy = new Proxy({}, {
            get: (_, prop) => (prop === 'sourceCode' ? sourceCode : bind(context, prop)),
        });
        return rule.create(proxy);
    },
});
const bind = (obj, prop) => { const v = obj[prop]; return typeof v === 'function' ? v.bind(obj) : v; };

export default {
    meta: { name: 'module-boundaries-oxlint', version: '0.0.0' },
    rules: Object.fromEntries(Object.entries(upstream.rules).map(([name, rule]) => [name, wrap(rule)])),
};
