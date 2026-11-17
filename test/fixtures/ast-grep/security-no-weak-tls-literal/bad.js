const tls = require('node:tls');
const https = require('node:https');

// 1: secureProtocol with obsolete methods
const a1 = { secureProtocol: 'SSLv3_method' };
const a2 = { secureProtocol: "SSLv2_method" };
const a3 = { secureProtocol: 'TLSv1_method' };
const a4 = { secureProtocol: 'TLSv1_1_method' };
const a5 = { secureProtocol: 'TLSv1_1_client_method' };
const a6 = { 'secureProtocol': 'TLSv1_server_method' };
const a7 = { secureProtocol: `SSLv3_method` };

// 2: minVersion / maxVersion with obsolete versions
const b1 = { minVersion: 'TLSv1' };
const b2 = { minVersion: 'TLSv1.1' };
const b3 = { maxVersion: 'TLSv1' };
const b4 = { maxVersion: "TLSv1.1" };
const b5 = { "minVersion": 'TLSv1' };

// 3: nested in a larger options object, multi-line
const agent = new https.Agent({
  keepAlive: true,
  minVersion: 'TLSv1.1',
  rejectUnauthorized: true,
});
tls.connect({ host: 'example.test', secureProtocol: 'TLSv1_method' });

// Literal wrappers, computed keys and optional receivers remain literal options.
const wrapped1 = { minVersion: ('TLSv1') };
const wrapped2 = { maxVersion: (((`TLSv1.1`))) };
const computed1 = { ['minVersion']: 'TLSv1' };
const computed2 = { [`maxVersion`]: `TLSv1.1` };
const computed3 = { [(("secureProtocol"))]: "SSLv3_client_method" };
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
