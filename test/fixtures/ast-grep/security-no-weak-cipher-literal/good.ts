// Modern CBC and GCM modes are not banned.
createCipheriv('aes-256-cbc', key, iv);
crypto.createDecipheriv('AES-128-CBC', key, iv);
createCipher('aes-192-gcm', key);
crypto.createDecipher('AES-256-GCM', key);
// Other strong algorithms and a weak family name outside the prefix.
createCipheriv('chacha20-poly1305', key, iv);
createCipheriv('not-des-cbc', key, iv);
// ECB must be preceded by a hyphen.
createCipheriv('aes-256ecb', key, iv);
// Literal in the wrong argument position.
createCipheriv('aes-256-gcm', 'rc4', iv);
createDecipheriv(algorithm, 'aes-128-ecb', iv);
// Other functions, including nearly identical names, are unrelated.
createHash('des');
recreateCipheriv('rc4', key, iv);
crypto.createCipherivExtra('bf', key, iv);
log('aes-128-ecb');
// No calls hidden in comments or strings count.
// createCipheriv('rc4', key, iv);
const documentation = "crypto.createDecipheriv('des-ede', key, iv)";
const otherText = 'createCipher("aes-128-ecb", key)';
// Indirection is intentionally outside this literal tripwire.
const algorithm = 'rc4';
createCipheriv(algorithm, key, iv);
const alias = createCipheriv;
alias('rc4', key, iv);
createCipheriv(...['rc4', key, iv]);
createCipheriv('rc' + '4', key, iv);
crypto[createCipheriv]('rc4', key, iv);
// An ordinary object containing an algorithm name is not a cipher call.
const options = { algorithm: 'des', mode: 'aes-128-ecb' };
// Strong algorithms in every wrapper and template form.
createCipheriv(('aes-256-gcm'), key, iv);
createCipheriv('aes-256-gcm' as string, key, 'rc4');
createCipheriv(`aes-${bits}-gcm`, key, iv);
createCipheriv(/* aes-128-ecb */ 'aes-256-cbc', key, iv);
// Weak names only in non-algorithm positions or type positions.
createCipheriv(key, 'rc4', iv);
createCipheriv(algorithm as 'rc4', key, iv);
createCipheriv(pick('rc4'), key, iv);
createCipheriv(flag ? 'rc4' : 'aes-256-gcm', key, iv);
createCipheriv(['rc4'], key, iv);
createCipheriv({ name: 'rc4' }, key, iv);
// Declarations and types named like the API are not calls.
type Maker = typeof createCipheriv;
interface Api { createCipheriv(algorithm: 'rc4', key: Buffer): void }
class Impl { createCipheriv(algorithm = 'rc4') {} }
function createCipher(algorithm = 'des') {}
// Calls with no arguments or other function names.
createCipheriv();
crypto.createSign('des');
