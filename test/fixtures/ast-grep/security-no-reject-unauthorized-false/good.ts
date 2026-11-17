// Enabled verification and non-boolean values are not this literal tripwire.
const enabled = { rejectUnauthorized: true };
const stringFalse = { rejectUnauthorized: 'false' };
const numericZero = { rejectUnauthorized: 0 };
const different = { rejectUnauthorizedElse: false };
// A false descendant must not be mistaken for the property's own value.
const nestedValue = { rejectUnauthorized: { fallback: false } };
// No alias, constant, computed-key or spread resolution is promised.
const disabled = false;
const key = 'rejectUnauthorized';
const indirect = { rejectUnauthorized: disabled };
const computed = { [key]: false };
const spread = { ...indirect };
const env = process.env;
env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const zero = '0';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = zero;
// Other values, receivers and environment variables are not the target.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 1;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = false;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '00';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = `00`;
process.env.OTHER_SETTING = '0';
settings.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
process.other.NODE_TLS_REJECT_UNAUTHORIZED = 0;
// Reading, comparison, object-member assignment and compound assignment are not covered.
const current = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
const comparison = process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0';
options.rejectUnauthorized = false;
process.env.NODE_TLS_REJECT_UNAUTHORIZED += '0';
// rejectUnauthorized: false
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
/* process['env']['NODE_TLS_REJECT_UNAUTHORIZED'] = 0; */
const prose = "rejectUnauthorized: false";
const sample = "process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'";
const template = `process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'`;
// Wrapper traversal never enters conditionals, calls or negations.
const condVal = { rejectUnauthorized: cond ? false : true };
const callVal = { rejectUnauthorized: fn(false) };
const negated = { rejectUnauthorized: !false };
// Keys that are not exactly the literal name, and non-literal computed keys.
const dynamicKey = { [`rejectUnauthorized${n}`]: false };
const padded = { 'rejectUnauthorized ': false };
class Holder { rejectUnauthorized = false; }
// Non-literal values, other receivers, other operators and other forms stay silent.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = cond ? '0' : '1';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = `0${extra}`;
process.env.NODE_TLS_REJECT_UNAUTHORIZED &&= '0';
process.env.NODE_TLS_REJECT_UNAUTHORIZED ||= '1';
foreign.process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
process.env[NODE_TLS_REJECT_UNAUTHORIZED] = '0';
Object.assign(process.env, { NODE_TLS_REJECT_UNAUTHORIZED: '0' });
const { NODE_TLS_REJECT_UNAUTHORIZED = '0' } = process.env;
// Type positions, type-only literals and assertions to false are not enabled-to-disabled settings.
type Opts2 = { rejectUnauthorized: false };
declare const typed: { rejectUnauthorized: false };
const castTo = { rejectUnauthorized: value as false };
