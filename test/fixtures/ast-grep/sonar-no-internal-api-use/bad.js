// Every flagged construct is on a line group listed in expected.json.
import { internal } from 'some-lib/node_modules/inner/index.js'; // violation: static import (line 2)
import 'node_modules/side-effect/index.js'; // violation: side-effect import (line 3)
import {
    first,
    second,
} from "../../node_modules/dep/multi-line"; // violation: multi-line import, reported at its first line (line 4)
export { named } from 'pkg/node_modules/inner'; // violation: export-from (line 8)
export * from '../node_modules/dep/all'; // violation: export-star-from (line 9)
export * as ns from './node_modules/dep/ns'; // violation: export-star-as-from (line 10)

const required = require('node_modules/dep/cjs'); // violation: require() (line 12)
const loaded = await import('pkg/node_modules/dep/lazy'); // violation: dynamic import() (line 13)
const quoted = require("../node_modules/dep/double"); // violation: double-quoted require (line 14)
const stripped = import('node_modules/dep/promise'); // violation: dynamic import without await (line 15)

void [internal, first, second, named, required, loaded, quoted, stripped];

// Literal edge cases from the adversarial verifier.
require(`node_modules/template`);
import(`node_modules/template`);
require?.('node_modules/optional');
require(('node_modules/parens'));
import(('node_modules/parens'));
(require)('node_modules/callee-parens');
require(/* comment */ 'node_modules/after-comment');
require((/* comment */ 'node_modules/wrapped-comment'));
require('node_modules/trailing',);
require('node_modules/first', 'safe');
import('node_modules/options', { with: { type: 'json' } });
