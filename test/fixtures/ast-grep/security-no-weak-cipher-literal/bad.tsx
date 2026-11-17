// Weak family prefixes are banned even when used with CBC.
createCipheriv('des-cbc', key, iv);
// Triple DES spelling with a hyphen.
crypto.createDecipheriv('des-ede-cbc', key, iv);
// Triple DES compact spelling, uppercase.
createCipher('DES3', key);
// Triple DES numeric spelling.
crypto.createDecipher('3des', key);
// RC2 family prefix.
createCipheriv('rc2-40-cbc', key, iv);
// RC4 family prefix, mixed case and double quotes.
crypto.createCipheriv("Rc4-40", key, iv);
// Blowfish short name.
createDecipheriv('bf-cbc', key, iv);
// Blowfish long name, mixed case.
crypto.createDecipher('BlOwFiSh', key);
// DES-EDE3 remains in the weak DES family.
createCipher('DES-EDE3-CBC', key);
// Modern cipher with ECB mode.
createCipheriv('aes-256-ecb', key, null);
// Uppercase ECB through a member call.
crypto.createDecipheriv('AES-128-ECB', key, null);
// ECB in a legacy cipher constructor.
createCipher('camellia-128-ecb', key);
// ECB in a legacy decipher constructor.
createDecipher('aes-192-ecb', key);
// The specification matches any occurrence of -ecb, not only a suffix.
crypto.createCipheriv('cipher-ecb-extra', key, iv);
// RC4 exact name.
createDecipheriv('rc4', key, iv);
// DES exact name.
createDecipher('des', key);
// A namespace chain is still a direct member call.
node.crypto.createCipheriv('bf', key, iv);
// Template literal without substitutions.
createCipheriv(`des-cbc`, key, iv);
// Bracket-literal member call.
crypto['createCipheriv']('rc4', key, iv);
// Optional chaining on the receiver.
crypto?.createCipheriv('rc4', key, iv);
// Optional call.
crypto.createCipheriv?.('rc4', key, iv);
// Parenthesized literal.
createCipheriv(('rc4'), key, iv);
// Comment before the literal.
createCipheriv(/* algorithm */ 'rc4', key, iv);
// Multi-line call is reported at its first line.
crypto.createCipheriv(
  'aes-128-ecb',
  key,
  null,
);
// Single argument.
createCipheriv('des-cbc');
// Template literal with a substitution before the ECB suffix.
createCipheriv(`aes-${bits}-ecb`, key, iv);
// Template-literal bracket property.
crypto[`createCipheriv`]('rc4', key, iv);
// Call nested in an expression chain.
const encrypted = createCipheriv('rc4', key, iv).update(data);
// Casts, satisfies and non-null assertions around the literal.
createCipheriv('rc4' as string, key, iv);
createCipheriv('rc4'!, key, iv);
createCipheriv('rc4' satisfies string, key, iv);
createCipheriv(('rc4' as string)!, key, iv);
crypto!.createCipheriv('rc4', key, iv);
// A call inside a JSX attribute expression.
const view = <Cipher instance={createCipheriv('rc4', key, iv)} />;
