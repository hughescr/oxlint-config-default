import * as tls from 'node:tls';
import * as https from 'node:https';

// 1: secureProtocol with obsolete methods
const a1: tls.ConnectionOptions = { secureProtocol: 'SSLv3_method' };
const a2: tls.ConnectionOptions = { secureProtocol: "SSLv2_method" };
const a3: tls.ConnectionOptions = { secureProtocol: 'TLSv1_method' };
const a4: tls.ConnectionOptions = { secureProtocol: 'TLSv1_1_method' };
const a5: tls.ConnectionOptions = { secureProtocol: 'TLSv1_1_client_method' };
const a6: tls.ConnectionOptions = { 'secureProtocol': 'TLSv1_server_method' };
const a7: tls.ConnectionOptions = { secureProtocol: `SSLv3_method` };

// 2: minVersion / maxVersion with obsolete versions
const b1: tls.SecureContextOptions = { minVersion: 'TLSv1' };
const b2: tls.SecureContextOptions = { minVersion: 'TLSv1.1' };
const b3: tls.SecureContextOptions = { maxVersion: 'TLSv1' };
const b4: tls.SecureContextOptions = { maxVersion: "TLSv1.1" };
const b5: tls.SecureContextOptions = { "minVersion": 'TLSv1' };

// 3: nested in a larger options object, multi-line
const agent = new https.Agent({
  keepAlive: true,
  minVersion: 'TLSv1.1',
  rejectUnauthorized: true,
});

// Literal wrappers, computed keys and optional receivers remain literal options.
const wrapped1 = { minVersion: ('TLSv1') };
const wrapped2 = { maxVersion: (((`TLSv1.1`))) };
const wrapped3 = { minVersion: 'TLSv1' as const };
const wrapped4 = { maxVersion: ('TLSv1.1' as tls.SecureVersion)! };
const wrapped5 = { secureProtocol: ('SSLv3_method'!) };
const wrapped6 = { minVersion: ('TLSv1' satisfies string) };
const wrapped7 = { minVersion: <string>'TLSv1' };
const computed1 = { ['minVersion']: 'TLSv1' };
const computed2 = { [`maxVersion`]: `TLSv1.1` };
const computed3 = { [(("secureProtocol"))]: "SSLv3_client_method" };
const computed4 = { [((`minVersion` as const)!)]: ('TLSv1' as string)! };
tls?.connect?.({ minVersion: 'TLSv1' });
other.open({ secureProtocol: 'TLSv1_server_method' });
const wrappedAcrossLines = {
  ['maxVersion']:
    ('TLSv1.1'),
};
const bare1 = { secureProtocol: 'SSLv2' };
const bare2 = { secureProtocol: 'SSLv3' };
const bare3 = { secureProtocol: 'TLSv1' };
const bare4 = { secureProtocol: `TLSv1_1` };
