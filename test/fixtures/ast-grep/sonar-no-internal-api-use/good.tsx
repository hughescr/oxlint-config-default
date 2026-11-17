// Near-misses that must NOT match.
import 'node_modules_shim';
export * from 'my_node_modules';
require('x/node_modulesfoo/y');
import { ok } from 'some-lib'; // plain package
import type { Shape } from './types'; // type import without the segment
import { dashed } from './node-modules/dep'; // hyphen, not underscore
export * from './barrel'; // export-star-from without the segment
import legacy = require('some-lib'); // import-equals require without the segment
// import { gone } from 'node_modules/in-a-line-comment';
/* const gone = require('node_modules/in-a-block-comment'); */

const plain = require('some-lib'); // require without the segment
const lazy = import('./local'); // dynamic import without the segment
const nested = require(String('node_modules/inner')); // string only inside a nested call, not the direct argument
const other = notRequire('node_modules/dep'); // different function

export const exportedDir = 'node_modules/dep'; // export of a string value, not an export-from
export const View =({ shape }: { shape: Shape }) => (
    <div title="node_modules/dep" data-note={'require("node_modules/dep")'}>
        node_modules/in-jsx-text {String(shape)} {String(ok)} {String(dashed)} {String(legacy)}
        require('node_modules/jsx-text')
        {String(plain)} {String(lazy)} {String(nested)} {String(other)}
    </div>
);

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
require(foo as 'node_modules/type-only');
require('safe' as 'node_modules/type-only');
require(foo!);
type NotAModule = 'node_modules/not-an-import';
