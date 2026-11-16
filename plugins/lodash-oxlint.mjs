import { fixupPluginRules } from '@eslint/compat';
import lodash from 'eslint-plugin-lodash';

// Lodash still calls legacy context methods; expose ESLint's compatibility adapter.
export default fixupPluginRules(lodash);
