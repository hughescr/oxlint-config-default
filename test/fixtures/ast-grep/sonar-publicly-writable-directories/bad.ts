// Unix prefixes: keep the trailing slash, as in SonarJS S5443.
const unixTmp = '/tmp/work';
const varTmp = '/var/tmp/work';
const usrTmp = '/usr/tmp/work';
const sharedMemory = '/dev/shm/work';
const messageQueue = '/dev/mqueue/work';
const lock = '/run/lock/work';
const varLock = '/var/run/lock/work';
const caches = '/Library/Caches/work';
const sharedUsers = '/Users/Shared/work';
const privateTmp = '/private/tmp/work';
const privateVarTmp = '/private/var/tmp/work';
// Matching is case-insensitive, including Unix paths (upstream behavior).
const upperCase = "/TMP/work";
// Windows forms: raw source text, drive-prefixed or rooted.
const windows = 'C:\\Windows\\Temp\\work';
const windowsTemp = 'D:\\Temp\\work';
const windowsTmp = 'C:\\TMP\\work';
const rootedTemp = '\\Temp\\work';
const windowsRoot = 'C:\\Windows\\Temp';
const tempRoot = 'C:\\Temp';
const tmpRoot = 'C:\\TMP';
const windowsCase = 'c:\\wInDoWs\\tEmP\\work';
// Direct environment member accesses.
const envTmpdir = process.env.TMPDIR;
const envTmp = process.env.TMP;
const envTempdir = process.env.TEMPDIR;
const envTemp = process.env.TEMP;
// Optional-chain member accesses must not escape detection.
const optionalEnv = process.env?.TMPDIR;
const optionalProcess = process?.env.TMP;
const optionalBoth = process?.env?.TEMPDIR;
const optionalTemp = process.env?.TEMP;
// A path literal is still a match as a call argument.
consume('/tmp/rendered');
// SonarJS matches raw source, even when Windows backslashes are not escaped.
const rawWindows = 'C:\Windows\Temp\work';
// Bracket access, including optional chains and template-literal names.
const bracket = process.env['TMPDIR'];
const bracketDouble = process.env["TEMP"];
const bracketProcess = process['env'].TMP;
const bracketBoth = process['env']['TEMPDIR'];
const bracketTemplate = process.env[`TMPDIR`];
const bracketOptional = process.env?.['TMP'];
const bracketOptionalBoth = process?.['env']?.['TEMP'];
// Parentheses and line breaks around the access.
const parenthesized = (process.env).TMPDIR;
const parenthesizedProcess = (process).env.TEMP;
const nestedParens = ((process.env))['TMP'];
const lineBreaks = process
    .env
    ?.TMPDIR;
// Template literals, with and without substitutions.
const template = `/tmp/work`;
const interpolation = `/tmp/${name}`;
const windowsTemplate = `C:\\Windows\\Temp\\${name}`;
const upperTemplate = `/VAR/TMP/work`;
// Type assertions, non-null assertions and satisfies wrappers.
const asEnv = (process.env as NodeJS.ProcessEnv).TMPDIR;
const asProcess = (process as NodeJS.Process).env.TEMP;
const angleEnv = (<any>process.env).TMP;
const angleProcess = (<any>process).env.TEMPDIR;
const nonNull = process.env!.TMP;
const nonNullProcess = process!.env.TEMPDIR;
const nonNullBracket = process.env!['TMP'];
const satisfiesEnv = (process.env satisfies object).TEMP;
const castValue = process.env.TMPDIR as string;
const bangValue = process.env.TMPDIR!;
const asLiteral = '/tmp/work' as const;
const parenthesizedLiteral = ('/tmp/work');
