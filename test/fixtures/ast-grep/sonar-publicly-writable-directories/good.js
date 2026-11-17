// Comments are not code: '/tmp/work', process.env.TMPDIR, process.env?.TMPDIR.
/* 'C:\\Windows\\Temp\\work' */
// Prefixes must start the string; names merely containing temp are not banned.
const documentation = 'Use /tmp/work or process.env.TMPDIR with care';
const embeddedWindows = 'Use C:/Windows/Temp/work with care';
const envText = 'process.env?.TMPDIR';
const embeddedUnix = 'file:///tmp/work';
const relativeUnix = 'tmp/work';
const privateHome = '/home/alice/tmp/work';
const unixPrefix = '/tmp-other/work';
const cachePrefix = '/Library/Caches-other/work';
const longerWindowsName = 'C:\\Temporary\\work';
const windowsSuffix = 'C:\\Windows\\Tempest\\work';
const privateWindows = 'C:\\Users\\Alice\\Temp\\work';
// Upstream Unix prefixes include a slash; bare roots are intentionally not matched.
const bareUnixRoot = '/tmp';
const bareCacheRoot = '/Library/Caches';
// Only the four exact uppercase properties on process.env are covered.
const otherEnv = process.env.HOME;
const lowerCase = process.env.tmpdir;
const longerProperty = process.env.TMPDIR_BACKUP;
const otherObject = config.env.TMPDIR;
const wrongBase = process.settings.TEMP;
const otherOptional = settings.env?.TMPDIR;
// Similar-looking safe code: other names, other receivers, dynamic keys and text that merely mentions a path.
const wrongBracket = process.env['HOME'];
const wrongTemplateName = process.env[`TMPDIR2`];
const dynamicName = process.env[name];
const identifierName = process.env[TMPDIR];
const otherBracket = config.env['TMPDIR'];
const otherProcess = other.process.env['TMPDIR'];
const parenthesizedOther = (config.env).TMPDIR;
const parenthesizedSafe = (process.env).HOME;
const templateText = `see /tmp/work`;
const templateSubstitution = `${base}/tmp/work`;
const templateRelative = `tmp/${name}`;
const templateLongerName = `/tmp-other/${name}`;
const windowsTemplateSafe = `C:\\Temporary\\${name}`;
// Known syntax-only gaps: aliases and destructuring are indirect forms.
const aliased = env.TMPDIR;
const { TMPDIR: destructured } = process.env;
// No raw-literal escape decoding, consistent with SonarJS.
const escapedSlash = '\x2ftmp/work';
const renderedText = <span>/tmp/work process.env.TMPDIR</span>;
