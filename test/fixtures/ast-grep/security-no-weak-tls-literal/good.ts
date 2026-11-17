import * as tls from 'node:tls';

// Modern settings
const a1: tls.SecureContextOptions = { minVersion: 'TLSv1.2' };
const a2: tls.SecureContextOptions = { minVersion: 'TLSv1.3' };
const a3: tls.SecureContextOptions = { maxVersion: 'TLSv1.3' };
const a4: tls.SecureContextOptions = { maxVersion: 'TLSv1.2' };
const a5: tls.ConnectionOptions = { secureProtocol: 'TLSv1_2_method' };
const a6: tls.ConnectionOptions = { secureProtocol: 'TLSv1_2_client_method' };
const a7: tls.ConnectionOptions = { secureProtocol: 'TLS_method' };
const a8: tls.ConnectionOptions = { secureProtocol: 'SSLv23_method' };

// Unrelated keys with the same weak text
const b1 = { protocol: 'TLSv1' };
const b2 = { version: 'TLSv1.1' };
const b3 = { label: 'SSLv3_method' };

// Not literal (knowingly not covered: indirect forms)
const WEAK = 'TLSv1';
const c1 = { minVersion: WEAK };
const c2 = { minVersion: `TLSv1${''}` };

// Strings that merely contain the text
const d1 = { minVersion: 'not TLSv1' };
const d2 = { minVersion: 'TLSv1.12' };
const d3 = { minVersion: 'TLSv1.10' };
const d4 = { secureProtocol: 'my_TLSv1_method' };
const d5 = { secureProtocol: 'TLSv1_20_method' };

// Comments: { minVersion: 'TLSv1' } and secureProtocol: 'SSLv3_method'
/* { maxVersion: 'TLSv1.1' } */
const e1 = "{ minVersion: 'TLSv1' }";
const e2 = 'secureProtocol: "SSLv3_method"';
const e3 = `minVersion: 'TLSv1.1'`;

// Value position only: not a property of an options object
const f1 = ['minVersion', 'TLSv1'];
const f2 = { other: 'minVersion', value: 'TLSv1' };

// Wrappers do not permit searching into calls, arrays, nested objects or types.
const safe1 = { ['minVersion']: ('TLSv1.3') };
const safe2 = { [(`secureProtocol` as const)!]: ('TLSv1_2_method' as const)! };
const safe3 = { minVersion: ('TLSv1.3' as 'TLSv1') };
const safe4 = { minVersion: ('TLSv1.2' satisfies 'TLSv1') };
const safe5 = { minVersion: ('TLSv1.3' as { minVersion: 'TLSv1' }) };
const safe6 = { minVersion: ((f('TLSv1')) as string)! };
const safe7 = { minVersion: ['TLSv1'] };
const safe8 = { minVersion: { unrelated: 'TLSv1' } };
const safe9 = { minVersion: ('TLSv1', 'TLSv1.3') };
const safe10 = { ['minVersion' + 'X']: 'TLSv1' };
other.minVersion('TLSv1');
type LegacyOptions = { minVersion: 'TLSv1'; secureProtocol: 'SSLv3_method' };
interface LegacyInterface { maxVersion: 'TLSv1.1' }
