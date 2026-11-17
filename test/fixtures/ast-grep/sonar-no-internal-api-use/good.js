// Near-misses that must NOT match.
import 'node_modules_shim';
export * from 'my_node_modules';
require('x/node_modulesfoo/y');
import { ok } from 'some-lib'; // plain package
import { sub } from 'some-lib/sub/path'; // subpath without the segment
import { dashed } from './node-modules/dep'; // hyphen, not underscore
import { camel } from './nodeModules/dep'; // different spelling
export { named } from './local'; // export-from without the segment
export * from './barrel'; // export-star-from without the segment
// import { gone } from 'node_modules/in-a-line-comment';
/* import { gone } from 'node_modules/in-a-block-comment'; */
/* const gone = require('node_modules/in-a-block-comment'); */

const plain = require('some-lib'); // require without the segment
const lazy = import('./local'); // dynamic import without the segment

// The same text in strings that are not module specifiers.
const note = 'import x from "node_modules/x"';
const tmpl = `require('node_modules/in-a-template')`;
const dir = 'node_modules';
const joined = require(`${dir}/dynamic-name`); // not a literal specifier: knowingly not matched
const nonLiteral = require(dir); // identifier argument
const concatenated = require('a' + dir); // not a direct string literal
const conditional = require(note ? 'one' : 'two'); // conditional argument
const nested = require(String('node_modules/inner')); // string only inside a nested call, not the direct argument
const twoArgs = require('some-lib', 'node_modules'); // string after the specifier is not the specifier
const other = notRequire('node_modules/dep'); // different function
const lazyOther = loadModule('node_modules/dep'); // different function
const importMeta = import.meta.url; // not a module specifier
const path = String('node_modules/dep/file'); // unrelated call
export const exportedDir = 'node_modules/dep'; // export of a string value, not an export-from
export default 'node_modules/default'; // default export of a string value
const objectKey ={ 'node_modules/dep': 1 }; // unrelated string

void [ok, sub, dashed, camel, plain, lazy, note, tmpl, joined, nonLiteral, concatenated, conditional, nested, twoArgs, other, lazyOther, importMeta, path, objectKey];

// Traversal must not escape the direct specifier or the bare loader.
obj.require('node_modules/receiver');
obj['require']('node_modules/bracket');
obj?.require('node_modules/optional-receiver');
obj.require?.('node_modules/optional-call');
obj['import']('node_modules/bracket-import');
require.resolve('node_modules/resolve');
require('safe', require('safe2', 'node_modules/nested-second'));
require((obj.require)('node_modules/nested-receiver'));
require(`node_modules/${suffix}`);
import('safe', { with: { type: 'node_modules/not-source' } });
