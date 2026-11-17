// Every flagged construct is on a line group listed in expected.json.
import { internal } from 'some-lib/node_modules/inner/index.js'; // violation: static import (line 2)
import type { Shape } from '../node_modules/dep/types'; // violation: type import (line 3)
import {
    first,
    second,
} from "../../node_modules/dep/multi-line"; // violation: multi-line import, reported at its first line (line 4)
export { named } from 'pkg/node_modules/inner'; // violation: export-from (line 8)
export * from '../node_modules/dep/all'; // violation: export-star-from (line 9)
import legacy = require('lib/node_modules/legacy'); // violation: import-equals require (line 10)

const required = require('node_modules/dep/cjs'); // violation: require() (line 12)
const loaded = await import('pkg/node_modules/dep/lazy'); // violation: dynamic import() (line 13)

export const View = () => {
    const lazy = import('node_modules/dep/view'); // violation: dynamic import inside a component (line 16)
    return <div data-lazy={String(lazy)}>{String(require('../node_modules/dep/jsx'))}</div>; // violation: require() inside JSX (line 17)
};

void [internal, first, second, named, legacy, required, loaded];
export type { Shape };

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
require('node_modules/cast' as string);
import(('node_modules/cast' as string)!);
require('node_modules/non-null'!);
require(('node_modules/satisfies') satisfies string);
(require as Function)('node_modules/cast-callee');
type InternalModule = typeof import('node_modules/type-query');
type InternalShape = import('node_modules/type-import').Shape;
