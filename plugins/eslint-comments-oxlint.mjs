// Wraps @eslint-community/eslint-plugin-eslint-comments so that its `column: -1` "force location"
// (ESLint trick to make a report immune to eslint-disable) becomes column 0, which Oxlint's location
// translation accepts.  Everything else is the upstream rule code, untouched.
import upstream from '@eslint-community/eslint-plugin-eslint-comments';

const fixLoc = loc => {
    if (loc?.start && loc.start.column < 0) return { ...loc, start: { ...loc.start, column: 0 } };
    return loc;
};
const wrap = rule => ({
    ...rule,
    create(context) {
        const proxy = new Proxy({}, {
            get(_, prop) {
                if (prop === 'report') return descriptor => context.report(descriptor.loc ? { ...descriptor, loc: fixLoc(descriptor.loc) } : descriptor);
                const value = context[prop];
                return typeof value === 'function' ? value.bind(context) : value;
            },
        });
        return rule.create(proxy);
    },
});
export default {
    meta: { name: 'eslint-comments-oxlint', version: '0.0.0' },
    rules: Object.fromEntries(Object.entries(upstream.rules).map(([name, rule]) => [name, wrap(rule)])),
};
