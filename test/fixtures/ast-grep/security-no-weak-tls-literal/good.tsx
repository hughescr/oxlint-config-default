import * as tls from 'node:tls';

export const Widget = () => {
  const a1: tls.SecureContextOptions = { minVersion: 'TLSv1.2' };
  const a2: tls.SecureContextOptions = { maxVersion: 'TLSv1.3' };
  const a3: tls.ConnectionOptions = { secureProtocol: 'TLSv1_2_method' };
  const b1 = { protocol: 'TLSv1' };
  // Comment: { minVersion: 'TLSv1' }
  const e1 = "{ minVersion: 'TLSv1' }";
  const e2 = 'secureProtocol: "SSLv3_method"';
  return <div title="minVersion: 'TLSv1'" data-a={a1} data-b={{ minVersion: 'TLSv1.3' }}>{String([a2, a3, b1, e1, e2])} secureProtocol: 'SSLv3_method'</div>;
};

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
const jsxText = <div>minVersion: 'TLSv1' secureProtocol: 'SSLv3_method'</div>;
const jsxComment = <div>{/* { minVersion: 'TLSv1' } */}</div>;
