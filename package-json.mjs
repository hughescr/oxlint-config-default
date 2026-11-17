import { configs } from 'eslint-plugin-package-json';

/**
 * ESLint flat config that lints `package.json` only, with eslint-plugin-package-json's recommended set
 * (the plugin's own `files: ['**\/package.json']` scoping and jsonc parser). Oxlint cannot lint JSON, so this
 * is the one place a project still runs ESLint. Re-export it from the project's ESLint config file:
 *
 *     export { default } from '@hughescr/oxlint-config-default/package-json';
 *
 * Nothing else is loaded, so the step takes about a tenth of a second.
 * @type {import('eslint').Linter.Config[]}
 */
const packageJson = [configs.recommended];
export default packageJson;
