import crypto, { createHash } from 'node:crypto';

// Nothing in this file may match.

// Strong algorithms.
export const g1 = crypto.createHash('sha256');
export const g2 = createHash('sha384');
export const g3 = crypto.createHash('SHA-512');
export const g4 = crypto.createHash('sha3-256');
export const g5 = crypto.createHash('blake2b512');
export const g6 = crypto.createHash('sha512-256');
export const g7 = crypto.createHash('sha224');
export const g8 = crypto.createHash('ripemd256'); // not in the sonarjs list

// Near-miss names inside the literal.
export const n1 = crypto.createHash('md5x');
export const n2 = crypto.createHash('xmd5');
export const n3 = crypto.createHash('md50');
export const n4 = crypto.createHash('sha10');
export const n5 = crypto.createHash('sha-12');
export const n6 = crypto.createHash('sha1 ');
export const n7 = crypto.createHash('md');
export const n8 = crypto.createHash('md3');
export const n9 = crypto.createHash('sha-256');
export const n10 = crypto.createHash('sha256-sha1');

// Not a literal: dynamic algorithms are knowingly not covered.
const algorithm = 'md5';
export const d1 = crypto.createHash(algorithm);
export const d2 = crypto.createHash(`${algorithm}`);
export const d3 = crypto.createHash(process.env.HASH_ALGORITHM ?? 'sha256');
export const d4 = crypto.createHash('sha' + '1');
export const d5 = crypto.createHash(algorithm.toLowerCase());

// The weak name is not the first argument.
export const f1 = crypto.createHash('sha256', 'md5');
export const f2 = crypto.createHash('sha256', { note: 'md5' });
export const f3 = crypto.createHash();

// Other functions with weak names as arguments.
export const o1 = crypto.createHmac('sha256', 'md5');
export const o2 = crypto.randomBytes(16).toString('hex');
export const o3 = crypto.pbkdf2Sync('pw', 'salt', 1, 32, 'sha1');
export const o4 = crypto.getHashes().includes('md5');
export const o5 = hashFile('md5');
export const o6 = createHashes('md5');
export const o7 = crypto.createHashed('md5');
export const o8 = crypto.subtle.digest.bind(crypto, 'SHA-1');

// Strong digests.
export async function strong(data: Uint8Array): Promise<ArrayBuffer[]> {
    return [
        await crypto.subtle.digest('SHA-256', data),
        await crypto.subtle.digest('SHA-384', data),
        await crypto.subtle.digest('SHA-512', data),
        await crypto.subtle.digest(algorithm, data),
        await crypto.subtle.sign('SHA-1', data),
        await crypto.subtle.importKey('SHA-1', data),
        await crypto.digest('SHA-1', data),
        await crypto.subtle.digest(),
    ];
}

// Weak names in comments:
// crypto.createHash('md5')
// crypto.subtle.digest('SHA-1', data)
/* crypto.createHash('sha1').update('x') */
/**
 * Never call `createHash('md5')` or `crypto.subtle.digest('SHA-1', data)` here.
 */
export const c1 = 1;

// Weak names in unrelated strings and templates:
export const s1 = "crypto.createHash('md5')";
export const s2 = 'crypto.createHash("sha1")';
export const s3 = `crypto.createHash('md5') and crypto.subtle.digest('SHA-1', x)`;
export const s4 = 'md5';
export const s5 = ['md5', 'sha1', 'SHA-1'];
export const s6 = { createHash: 'md5', digest: 'sha1' };
export const s7 = `uses ${algorithm} to hash`;

// A function merely named createHash with a non-literal argument.
export function createHashOf(name: string): string {
    return createHash(name).digest('hex');
}

// Adversarial negatives: nested literals and type positions are not the argument value.
other.digest('SHA-1', data);
other.subtle.digest('SHA-256', data);
crypto['createHashes']('md5');
crypto['subtles']['digest']('SHA-1', data);
createHash({ name: 'md5' });
createHash('sha256' || 'md5');
createHash(() => 'md5');
createHash(['md5']);
createHash(('sha256', 'md5'));
createHash?.('sha512');
createHash('sha256' as 'md5');
createHash('sha256' satisfies 'md5');
type HashReturn = ReturnType<typeof createHash<'md5'>>;
type HashFields = { createHash: 'md5' };
// Deliberate blind spots: aliases, constants and spreads require data flow.
const makeHash = crypto.createHash;
makeHash('md5');
createHash(...['md5']);
createHash('RSA-SHA256');
createHash('sha512-224');
createHash('shake128');
crypto.subtle.digest({ name: 'SHA-256' }, data);
crypto.subtle.digest({ name: 'sha224' }, data);
crypto.subtle.digest({ name: 'sha3-256' }, data);
crypto.subtle.digest({ name: 'sha512-224' }, data);
crypto.subtle.digest({ name: 'shake256' }, data);
crypto.subtle.digest({ name: 'RSA-SHA256' }, data);
crypto.subtle.digest({ nested: { name: 'SHA-1' } }, data);
crypto.subtle.digest({ other: 'SHA-1' }, data);
crypto.subtle.digest('SHA-256', { name: 'SHA-1' });
// Strong names from crypto.getHashes() that resemble weak ones.
createHash('RSA-SHA3-256');
createHash('RSA-SHA512/224');
createHash('sm3WithRSAEncryption');
createHash('sm3');
createHash('blake2b512');
createHash('blake2s256');
createHash('RSA-SHA384');
createHash('ripemd-256');
createHash('ripemd160x');
createHash('rsa-ripemd');
