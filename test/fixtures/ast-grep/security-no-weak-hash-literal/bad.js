import crypto, { createHash } from 'node:crypto';
import * as nodeCrypto from 'node:crypto';

// Each line ending in "// BAD" must produce exactly one match, reported on that line.
export const a1 = crypto.createHash('md5').update('x').digest('hex'); // BAD
export const a2 = createHash('sha1').update('x').digest('hex'); // BAD
export const a3 = nodeCrypto.createHash('SHA1'); // BAD
export const a4 = crypto.createHash('sha-1'); // BAD
export const a5 = crypto.createHash('SHA-1'); // BAD
export const a6 = crypto.createHash('Md5'); // BAD
export const a7 = crypto.createHash("md5"); // BAD
export const a8 = crypto.createHash(`md5`); // BAD
export const a9 = crypto.createHash('md2'); // BAD
export const a10 = crypto.createHash('md4'); // BAD
export const a11 = crypto.createHash('md6'); // BAD
export const a12 = crypto.createHash('haval-128'); // BAD
export const a13 = crypto.createHash('haval128'); // BAD
export const a14 = crypto.createHash('hmacmd5'); // BAD
export const a15 = crypto.createHash('dsa'); // BAD
export const a16 = crypto.createHash('ripemd'); // BAD
export const a17 = crypto.createHash('ripemd128'); // BAD
export const a18 = crypto.createHash('ripemd160'); // BAD
export const a19 = crypto.createHash('RIPEMD160'); // BAD
export const a20 = crypto.createHash('hmacripemd160'); // BAD
export const a21 = crypto.createHash('rsa-sha1'); // BAD
export const a22 = crypto.createHash('md5', { outputLength: 16 }); // BAD
export const a23 = globalThis.crypto.createHash('md5'); // BAD
export const a24 = this.deps.crypto.createHash('sha1'); // BAD

export async function subtle(data) {
    const x = await crypto.subtle.digest('SHA-1', data); // BAD
    const y = await globalThis.crypto.subtle.digest('sha-1', data); // BAD
    const z = await window.crypto.subtle.digest(`SHA-1`, data); // BAD
    void y;
    void z;
    return x;
}

export const multiline = crypto.createHash( // BAD
    'md5',
);

// A call that starts on a line above its `.createHash(` is reported on the line where the whole call expression starts.
export const chained = crypto // BAD
    .createHash('sha1')
    .update('x')
    .digest('hex');

export function inReturn() {
    return crypto.createHash('md5').digest('hex'); // BAD
}

export const optional = crypto?.createHash('md5'); // BAD

// Adversarial regressions: transparent wrappers, computed properties and optional calls.
createHash(('MD5')); // BAD
crypto['createHash']('sha1'); // BAD
crypto[`createHash`](`MD4`); // BAD
crypto?.['createHash']?.('MD6'); // BAD
crypto?.subtle?.digest?.('SHA-1', data); // BAD
crypto['subtle']['digest']('sha-1', data); // BAD
crypto[`subtle`].digest('SHA1', data); // BAD
(createHash)('md5'); // BAD
crypto.createHash(/* note */ (`md5`)); // BAD
createHash( // BAD
    'hmacripemd160',
);
other.createHash('dsa'); // BAD
crypto.subtle['digest'](('SHA-1'), data); // BAD
createHash('md5WithRSAEncryption'); // BAD
createHash('SHA1WITHRSAENCRYPTION'); // BAD
createHash('md5-sha1'); // BAD
createHash('ssl3-md5'); // BAD
createHash('SSL3-SHA1'); // BAD
createHash('RSA-SHA1'); // BAD
createHash('rsa-sha1-2'); // BAD
createHash('RSA-MD5'); // BAD
crypto.subtle.digest({ name: 'SHA-1' }, data); // BAD
crypto.subtle['digest']({ 'name': 'sha1', extra: true }, data); // BAD
createHash('RSA-RIPEMD160'); // BAD
createHash('ripemd-160'); // BAD
createHash('ripemd160WithRSA'); // BAD
