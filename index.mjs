import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

// Resolve future bundled plugins here, not relative to the consumer's config.
function jsPlugin(name, packageName) {
    return { name, specifier: require.resolve(packageName) };
}

export default {
    categories: {
        correctness: 'off',
        suspicious: 'off',
        pedantic: 'off',
        perf: 'off',
        style: 'off',
        restriction: 'off',
        nursery: 'off',
    },
    // Rule mapping and JS plugin dependencies are not yet populated.
    // Future example: jsPlugins: [jsPlugin('example', 'eslint-plugin-example')],
    rules: {
        'no-debugger': 'error',
    },
};
