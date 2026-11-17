// Unquoted option disables certificate verification.
const bare = { rejectUnauthorized: false };
// Single-quoted option has the same effect.
const single = { 'rejectUnauthorized': false };
// Double-quoted option has the same effect.
const double = { "rejectUnauthorized": false };
// Direct environment assignment with string zero.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
// Bracket environment key with string zero.
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
// Bracket env access with string zero.
process['env'].NODE_TLS_REJECT_UNAUTHORIZED = '0';
// Both accesses bracketed with string zero.
process['env']['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
// Direct environment assignment with numeric zero.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
// Bracket environment key with numeric zero.
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
// Bracket env access with numeric zero.
process['env'].NODE_TLS_REJECT_UNAUTHORIZED = 0;
// Both accesses bracketed with numeric zero.
process['env']['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
// Double-quoted bracket keys and string zero are also literals.
process["env"]["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
// Nested options are still literal object properties.
const nested = { tls: { rejectUnauthorized: false } };
// Comments between the property tokens do not change its meaning.
const spaced = { rejectUnauthorized /* unsafe */: /* disabled */ false };
// Parenthesized values and literal computed keys.
const paren = { rejectUnauthorized: (false) };
const computedQuoted = { ['rejectUnauthorized']: false };
const computedTemplate = { [`rejectUnauthorized`]: false };
// No-substitution template zero, parenthesized values and receivers, globalThis.process, ||= and ??=.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = `0`;
(process.env).NODE_TLS_REJECT_UNAUTHORIZED = ('0');
globalThis.process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
process.env.NODE_TLS_REJECT_UNAUTHORIZED ||= '0';
process.env.NODE_TLS_REJECT_UNAUTHORIZED ??= 0;
// Line breaks inside the assignment do not matter (reported at the statement start).
process.env
  .NODE_TLS_REJECT_UNAUTHORIZED
  = '0';
