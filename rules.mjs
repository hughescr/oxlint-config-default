// Effective generic ESLint rules, ported using the verified Oxlint mapping.
// Lists contain only explicitly enabled rules; category defaults never add rules.
const levels = (level, names) => Object.fromEntries(names.split(/\s+/u).filter(Boolean).map(name => [name, level]));
const errors = names => levels('error', names);
const warnings = names => levels('warn', names);

export const core = {
    ...errors(`constructor-super for-direction no-async-promise-executor no-case-declarations
        no-class-assign no-compare-neg-zero no-const-assign no-constant-binary-expression no-debugger
        no-delete-var no-dupe-class-members no-dupe-else-if no-dupe-keys no-duplicate-case
        no-empty-static-block no-ex-assign no-func-assign no-import-assign no-loss-of-precision
        no-new-native-nonconstructor no-nonoctal-decimal-escape no-obj-calls no-regex-spaces
        no-setter-return no-sparse-arrays no-this-before-super no-unassigned-vars no-unexpected-multiline
        no-unreachable no-unsafe-finally no-unused-labels no-unused-private-class-members
        no-useless-assignment no-useless-catch no-with require-yield no-nested-ternary block-scoped-var
        default-param-last no-loop-func no-self-compare no-unmodified-loop-condition no-useless-call
        no-useless-concat no-template-curly-in-string no-new-wrappers no-throw-literal
        no-new oxc/missing-throw`),
    ...warnings(`default-case-last no-constructor-return no-var prefer-object-spread no-await-in-loop
        symbol-description prefer-template prefer-exponentiation-operator logical-assignment-operators
        prefer-object-has-own no-useless-constructor no-useless-return object-shorthand`),
    'getter-return': ['error', { allowImplicit: false }],
    'no-cond-assign': ['error', 'except-parens'],
    'no-constant-condition': ['warn', { checkLoops: 'allExceptWhileTrue' }],
    'no-empty': ['error', { allowEmptyCatch: false }],
    'no-empty-pattern': ['error', { allowObjectPatternsAsParameters: false }],
    'no-extra-boolean-cast': ['error', {}],
    'no-fallthrough': ['error', { allowEmptyCase: true, reportUnusedFallthroughComment: true }],
    'no-global-assign': ['error', { exceptions: [] }],
    'no-irregular-whitespace': ['error', { skipComments: false, skipJSXText: false, skipRegExps: false, skipStrings: true, skipTemplates: false }],
    'no-misleading-character-class': ['error', { allowEscape: false }],
    'no-prototype-builtins': 'error',
    'no-redeclare': ['error', { builtinGlobals: true }],
    'no-self-assign': ['error', { props: true }],
    'no-shadow-restricted-names': ['error', { reportGlobalThis: true }],
    'no-undef': ['error', { typeof: false }],
    'no-unsafe-negation': ['error', { enforceForOrderingRelations: false }],
    'no-unsafe-optional-chaining': ['error', { disallowArithmeticOperators: false }],
    'no-unused-vars': ['warn', { args: 'after-used', argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-useless-escape': ['error', { allowRegexCharacters: [] }],
    // Oxlint rejects ESLint's errorClassNames option.
    'preserve-caught-error': ['error', { requireCatchParameter: false }],
    'use-isnan': ['error', { enforceForIndexOf: false, enforceForSwitchCase: true }],
    'valid-typeof': ['error', { requireStringLiterals: false }],
    'prefer-regex-literals': ['error', { disallowRedundantWrapping: false }],
    'array-callback-return': ['warn', { allowImplicit: false, checkForEach: false, allowVoid: false }],
    'complexity': ['warn', 15],
    'curly': ['warn', 'all'],
    'eqeqeq': ['warn', 'always'],
    'no-bitwise': ['warn', { allow: [], int32Hint: false }],
    'no-console': ['warn', {}],
    'no-eval': ['warn', { allowIndirect: false }],
    'no-param-reassign': ['warn', { props: false }],
    'no-promise-executor-return': ['error', { allowVoid: false }],
    'no-restricted-imports': ['warn', { paths: [{ name: 'lodash', message: 'Use lodash-es instead for proper ESM tree-shaking.' }] }],
    'no-return-assign': ['error', 'always'],
    'no-sequences': ['error', { allowInParentheses: true }],
    'no-shadow': ['warn', { allow: [], builtinGlobals: false, hoist: 'functions', ignoreOnInitialization: false, ignoreTypeValueShadow: true, ignoreFunctionTypeParameterNameValueShadow: true }],
    'no-unneeded-ternary': ['error', { defaultAssignment: true }],
    'no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true, allowTaggedTemplates: false, enforceForJSX: false, ignoreDirectives: false }],
    'no-use-before-define': ['error', 'nofunc'],
    'no-warning-comments': ['warn', { location: 'anywhere', terms: ['todo', 'fixme', 'xxx'] }],
    'prefer-arrow-callback': ['warn', { allowNamedFunctions: true, allowUnboundThis: true }],
    'prefer-const': ['warn', { destructuring: 'any', ignoreReadBeforeAssign: false }],
    'no-unreachable-loop': ['error', { ignore: [] }],
    'prefer-promise-reject-errors': ['warn', { allowEmptyReject: false }],
    'accessor-pairs': ['warn', { enforceForTSTypes: false, enforceForClassMembers: true, getWithoutSet: false, setWithoutGet: true }],
    'no-useless-computed-key': ['warn', { enforceForClassMembers: true }],
    'no-useless-rename': ['warn', { ignoreDestructuring: false, ignoreImport: false, ignoreExport: false }],
};

export const stylistic = {
    '@stylistic/array-bracket-spacing': ['warn', 'never', { arraysInArrays: false, objectsInArrays: false }],
    '@stylistic/arrow-parens': ['error', 'as-needed', { requireForBlockBody: true }],
    '@stylistic/arrow-spacing': ['warn', { before: true, after: true }],
    '@stylistic/block-spacing': ['warn', 'always'],
    '@stylistic/brace-style': ['warn', '1tbs', { allowSingleLine: true }],
    '@stylistic/comma-dangle': ['warn', { objects: 'only-multiline', arrays: 'only-multiline', functions: 'never', imports: 'never', exports: 'never' }],
    '@stylistic/comma-spacing': ['warn', { before: false, after: true }],
    '@stylistic/comma-style': ['error', 'last'],
    '@stylistic/computed-property-spacing': ['error', 'never', { enforceForClassMembers: true }],
    '@stylistic/dot-location': ['error', 'property'],
    '@stylistic/eol-last': ['warn', 'always'],
    '@stylistic/generator-star-spacing': ['error', { before: false, after: true }],
    '@stylistic/indent': ['warn', 4, { SwitchCase: 1, flatTernaryExpressions: false, ignoredNodes: [], MemberExpression: 'off' }],
    '@stylistic/indent-binary-ops': ['error', 2],
    '@stylistic/key-spacing': ['warn', { beforeColon: false, afterColon: true, align: 'value' }],
    '@stylistic/keyword-spacing': ['warn', { before: true, after: true, overrides: { if: { after: false }, for: { after: false }, while: { after: false }, continue: { after: false }, catch: { after: false }, switch: { after: false } } }],
    '@stylistic/lines-between-class-members': ['error', 'always', { exceptAfterOverload: true, exceptAfterSingleLine: true }],
    '@stylistic/max-statements-per-line': ['error', { max: 1 }],
    '@stylistic/member-delimiter-style': ['error', { multiline: { delimiter: 'none', requireLast: false }, singleline: { delimiter: 'comma', requireLast: false }, multilineDetection: 'brackets', overrides: { interface: { multiline: { delimiter: 'none', requireLast: false } } } }],
    '@stylistic/multiline-ternary': ['error', 'always-multiline'],
    '@stylistic/new-parens': ['error', 'always'],
    '@stylistic/no-extra-parens': ['error', 'functions'],
    '@stylistic/no-floating-decimal': 'error',
    '@stylistic/no-mixed-operators': ['error', { groups: [['==', '!=', '===', '!==', '>', '>=', '<', '<='], ['&&', '||'], ['in', 'instanceof']], allowSamePrecedence: true }],
    '@stylistic/no-mixed-spaces-and-tabs': ['error', false],
    '@stylistic/no-multiple-empty-lines': ['error', { max: 1, maxBOF: 0, maxEOF: 0 }],
    '@stylistic/no-tabs': ['error', { allowIndentationTabs: false }],
    '@stylistic/no-trailing-spaces': ['warn', { skipBlankLines: false, ignoreComments: false }],
    '@stylistic/no-whitespace-before-property': 'error',
    '@stylistic/object-curly-spacing': ['warn', 'always', { arraysInObjects: true }],
    '@stylistic/operator-linebreak': ['error', 'before'],
    '@stylistic/padded-blocks': ['warn', 'never', { allowSingleLineBlocks: false }],
    '@stylistic/quote-props': ['warn', 'as-needed', { keywords: true, numbers: true }],
    '@stylistic/quotes': ['warn', 'single', { allowTemplateLiterals: 'avoidEscape', avoidEscape: true, ignoreStringLiterals: false }],
    '@stylistic/rest-spread-spacing': ['error', 'never'],
    '@stylistic/semi': ['error', 'always'],
    '@stylistic/semi-spacing': ['error', { before: false, after: true }],
    '@stylistic/space-before-blocks': ['warn', { functions: 'always', keywords: 'always', classes: 'always' }],
    '@stylistic/space-before-function-paren': ['warn', { anonymous: 'never', named: 'never', asyncArrow: 'always' }],
    '@stylistic/space-in-parens': ['warn', 'never'],
    '@stylistic/space-infix-ops': ['warn', { int32Hint: false, ignoreTypes: false }],
    '@stylistic/space-unary-ops': ['warn', { words: true, nonwords: false }],
    '@stylistic/spaced-comment': ['error', 'always', { block: { balanced: true, exceptions: ['*'], markers: ['!'] }, line: { exceptions: ['/', '#'], markers: ['/'] } }],
    '@stylistic/template-curly-spacing': ['error', 'never'],
    '@stylistic/template-tag-spacing': ['error', 'never'],
    '@stylistic/type-annotation-spacing': ['error', {}],
    '@stylistic/type-generic-spacing': 'error',
    '@stylistic/type-named-tuple-spacing': 'error',
    '@stylistic/wrap-iife': ['error', 'any', { functionPrototypeMethods: true }],
    '@stylistic/yield-star-spacing': ['error', { after: true, before: false }],
    '@stylistic/jsx-closing-bracket-location': ['error', 'tag-aligned'],
    '@stylistic/jsx-closing-tag-location': ['error', 'tag-aligned'],
    '@stylistic/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never', propElementValues: 'always' }],
    '@stylistic/jsx-curly-newline': ['error', 'consistent'],
    '@stylistic/jsx-curly-spacing': ['error', 'never'],
    '@stylistic/jsx-equals-spacing': ['error', 'never'],
    '@stylistic/jsx-first-prop-new-line': ['error', 'multiline-multiprop'],
    '@stylistic/jsx-function-call-newline': ['error', 'multiline'],
    '@stylistic/jsx-indent-props': ['error', 2],
    '@stylistic/jsx-max-props-per-line': ['error', { maximum: 1, when: 'multiline' }],
    '@stylistic/jsx-one-expression-per-line': ['error', { allow: 'single-child' }],
    '@stylistic/jsx-quotes': ['error', 'prefer-double'],
    '@stylistic/jsx-tag-spacing': ['error', { closingSlash: 'never', beforeSelfClosing: 'always', afterOpening: 'never', beforeClosing: 'never' }],
    '@stylistic/jsx-wrap-multilines': ['error', { declaration: 'parens-new-line', assignment: 'parens-new-line', return: 'parens-new-line', arrow: 'parens-new-line', condition: 'parens-new-line', logical: 'parens-new-line', prop: 'parens-new-line', propertyValue: 'parens-new-line' }],
    '@stylistic/function-call-spacing': ['warn', 'never'],
    '@stylistic/linebreak-style': ['warn', 'unix'],
    '@stylistic/no-confusing-arrow': ['warn', { allowParens: true, onlyOneSimpleParam: false }],
};

export const nodeJs = errors(`n-js/no-deprecated-api n-js/no-extraneous-require n-js/no-missing-require
    n-js/no-process-exit n-js/no-unpublished-require n-js/no-unsupported-features/es-builtins
    n-js/hashbang n-js/no-callback-literal n-js/no-missing-import n-js/no-unpublished-import`);
export const node = {
    'node/no-exports-assign': 'error',
    'node/callback-return': ['error', ['callback', 'cb', 'next', 'done']],
    'node/handle-callback-err': 'warn',
    'node/no-path-concat': 'error',
    'node/no-sync': 'warn',
};

export const lodash = {
    ...warnings(`lodash/callback-binding lodash/collection-method-value lodash/collection-ordering
        lodash/collection-return lodash/matches-prop-shorthand lodash/no-commit lodash/no-double-unwrap
        lodash/no-extra-args lodash/no-unbound-this lodash/prefer-immutable-method lodash/preferred-alias lodash/unwrap`),
    'lodash/chain-style': ['warn', 'as-needed'],
    'lodash/chaining': ['warn', 'always', 2],
    'lodash/consistent-compose': ['warn', 'flow'],
    'lodash/identity-shorthand': ['warn', 'always'],
    'lodash/matches-shorthand': ['warn', 'always', 3],
    'lodash/path-style': ['warn', 'as-needed'],
    'lodash/prop-shorthand': ['warn', 'always'],
    ...warnings(`lodash-es/enforce-destructuring lodash-es/no-method-imports lodash-es/enforce-functions
        lodash-es/suggest-native-alternatives`),
};
export const promise = {
    ...warnings(`promise/always-return promise/param-names promise/catch-or-return promise/no-nesting
        promise/no-promise-in-callback promise/no-callback-in-promise promise/no-return-in-finally
        promise/valid-params promise/prefer-catch`),
    ...errors('promise/no-return-wrap promise/no-new-statics'),
};
export const comments = {
    '@eslint-community/eslint-comments/disable-enable-pair': ['warn', { allowWholeFile: true }],
    ...warnings(`@eslint-community/eslint-comments/no-duplicate-disable
        @eslint-community/eslint-comments/no-unlimited-disable @eslint-community/eslint-comments/no-unused-enable
        @eslint-community/eslint-comments/require-description`),
    '@eslint-community/eslint-comments/no-use': ['warn', { allow: ['eslint-disable', 'eslint-enable', 'eslint-disable-line', 'eslint-disable-next-line'] }],
};
export const regexp = {
    ...warnings(`regexp/confusing-quantifier regexp/match-any regexp/no-dupe-characters-character-class
        regexp/no-empty-alternative regexp/no-empty-group regexp/no-empty-lookarounds-assertion
        regexp/no-escape-backspace regexp/no-invisible-character regexp/no-lazy-ends
        regexp/no-potentially-useless-backreference regexp/no-useless-flag regexp/no-useless-two-nums-quantifier
        regexp/optimal-lookaround-quantifier regexp/prefer-d regexp/prefer-plus-quantifier
        regexp/prefer-question-quantifier regexp/prefer-star-quantifier regexp/prefer-w
        regexp/no-octal regexp/no-super-linear-move`),
    ...errors(`regexp/control-character-escape regexp/negation regexp/no-contradiction-with-assertion
        regexp/no-dupe-disjunctions regexp/no-empty-capturing-group regexp/no-empty-character-class
        regexp/no-empty-string-literal regexp/no-extra-lookaround-assertions regexp/no-invalid-regexp
        regexp/no-legacy-features regexp/no-misleading-capturing-group regexp/no-misleading-unicode-character
        regexp/no-missing-g-flag regexp/no-non-standard-flag regexp/no-obscure-range regexp/no-optional-assertion
        regexp/no-super-linear-backtracking regexp/no-trivially-nested-assertion regexp/no-trivially-nested-quantifier
        regexp/no-unused-capturing-group regexp/no-useless-assertions regexp/no-useless-character-class
        regexp/no-useless-dollar-replacements regexp/no-useless-escape regexp/no-useless-lazy
        regexp/no-useless-non-capturing-group regexp/no-useless-quantifier regexp/no-useless-range
        regexp/no-useless-set-operand regexp/no-useless-string-literal regexp/no-zero-quantifier
        regexp/optimal-quantifier-concatenation regexp/prefer-character-class regexp/prefer-predefined-assertion
        regexp/prefer-range regexp/prefer-set-operation regexp/prefer-unicode-codepoint-escapes
        regexp/simplify-set-operations regexp/sort-flags regexp/strict regexp/use-ignore-case`),
};
export const unicorn = {
    ...errors(`unicorn/consistent-assert unicorn/consistent-date-clone unicorn/consistent-empty-array-spread
        unicorn/consistent-existence-index-check unicorn/consistent-template-literal-escape unicorn/empty-brace-spaces
        unicorn/error-message unicorn/escape-case unicorn/new-for-builtins unicorn/no-abusive-eslint-disable
        unicorn/no-accessor-recursion unicorn/no-anonymous-default-export unicorn/no-array-callback-reference
        unicorn/no-array-for-each unicorn/no-array-method-this-argument unicorn/no-await-expression-member
        unicorn/no-await-in-promise-methods unicorn/no-console-spaces unicorn/no-document-cookie unicorn/no-empty-file
        unicorn/no-hex-escape unicorn/no-immediate-mutation unicorn/no-invalid-fetch-options
        unicorn/no-invalid-remove-event-listener unicorn/no-lonely-if unicorn/no-magic-array-flat-depth
        unicorn/no-negated-condition unicorn/no-negation-in-equality-check unicorn/no-nested-ternary
        unicorn/no-new-array unicorn/no-new-buffer unicorn/no-object-as-default-parameter unicorn/no-process-exit
        unicorn/no-single-promise-in-promise-methods unicorn/no-static-only-class unicorn/no-thenable
        unicorn/no-this-assignment unicorn/no-unnecessary-array-flat-depth unicorn/no-unnecessary-array-splice-count
        unicorn/no-unnecessary-await unicorn/no-unnecessary-slice-end unicorn/no-unreadable-array-destructuring
        unicorn/no-unreadable-iife unicorn/no-useless-collection-argument unicorn/no-useless-fallback-in-spread
        unicorn/no-useless-iterator-to-array unicorn/no-useless-length-check unicorn/no-useless-promise-resolve-reject
        unicorn/no-useless-spread unicorn/no-useless-switch-case unicorn/no-zero-fractions unicorn/number-literal-case
        unicorn/prefer-add-event-listener unicorn/prefer-array-find unicorn/prefer-array-flat unicorn/prefer-array-flat-map
        unicorn/prefer-array-index-of unicorn/prefer-array-some unicorn/prefer-bigint-literals unicorn/prefer-blob-reading-methods
        unicorn/prefer-class-fields unicorn/prefer-classlist-toggle unicorn/prefer-code-point unicorn/prefer-date-now
        unicorn/prefer-default-parameters unicorn/prefer-dom-node-append unicorn/prefer-dom-node-dataset
        unicorn/prefer-dom-node-remove unicorn/prefer-dom-node-text-content unicorn/prefer-event-target
        unicorn/prefer-global-this unicorn/prefer-includes unicorn/prefer-keyboard-event-key
        unicorn/prefer-logical-operator-over-ternary unicorn/prefer-math-min-max unicorn/prefer-math-trunc
        unicorn/prefer-modern-dom-apis unicorn/prefer-modern-math-apis unicorn/prefer-module
        unicorn/prefer-native-coercion-functions unicorn/prefer-negative-index unicorn/prefer-node-protocol
        unicorn/prefer-optional-catch-binding unicorn/prefer-prototype-methods unicorn/prefer-query-selector
        unicorn/prefer-reflect-apply unicorn/prefer-regexp-test unicorn/prefer-response-static-json
        unicorn/prefer-set-has unicorn/prefer-set-size unicorn/prefer-spread unicorn/prefer-string-raw
        unicorn/prefer-string-replace-all unicorn/prefer-string-slice unicorn/prefer-string-starts-ends-with
        unicorn/prefer-string-trim-start-end unicorn/prefer-top-level-await unicorn/prefer-type-error
        unicorn/require-array-join-separator unicorn/require-module-attributes unicorn/require-module-specifiers
        unicorn/require-number-to-fixed-digits-argument unicorn/switch-case-break-position unicorn/throw-new-error`),
    'unicorn/catch-error-name': ['warn', { name: 'error', ignore: ['^e$', '^err$', '^error$'] }],
    'unicorn/consistent-function-scoping': ['error', { checkArrowFunctions: true }],
    'unicorn/explicit-length-check': ['error', { 'non-zero': 'greater-than' }],
    'unicorn/filename-case': ['warn', { cases: { kebabCase: true, pascalCase: true } }],
    'unicorn/import-style': ['error', {}],
    'unicorn/no-array-reduce': ['error', { allowSimpleOperations: true }],
    'unicorn/no-array-reverse': ['error', { allowExpressionStatement: true }],
    'unicorn/no-array-sort': ['error', { allowExpressionStatement: true }],
    'unicorn/no-instanceof-builtins': ['error', { useErrorIsError: false, strategy: 'loose', include: [], exclude: [] }],
    'unicorn/no-typeof-undefined': ['error', { checkGlobalVariables: false }],
    // Deliberately use Oxlint's own numeric separator behavior.
    'unicorn/numeric-separators-style': 'error',
    'unicorn/prefer-export-from': ['error', {}],
    'unicorn/prefer-number-properties': ['error', { checkInfinity: false, checkNaN: true }],
    'unicorn/prefer-object-from-entries': ['error', { functions: [] }],
    'unicorn/prefer-single-call': ['error', { ignore: [] }],
    'unicorn/prefer-structured-clone': ['error', { functions: [] }],
    'unicorn/prefer-ternary': ['error', 'always'],
    'unicorn/relative-url-style': ['error', 'never'],
    'unicorn/switch-case-braces': ['error', 'always'],
    'unicorn/text-encoding-identifier-case': ['error', { withDash: false }],
};
export const unicornJs = {
    'unicorn-js/expiring-todo-comments': ['error', { terms: ['todo', 'fixme', 'xxx'], ignore: [], ignoreDates: false, ignoreDatesOnPullRequests: true, allowWarningComments: true }],
    'unicorn-js/isolated-functions': ['error', { functions: ['makeSynchronous'], selectors: [], comments: ['@isolated'], overrideGlobals: {} }],
    ...errors(`unicorn-js/no-for-loop unicorn-js/no-named-default unicorn-js/no-unnecessary-polyfills
        unicorn-js/prefer-simple-condition-first`),
    'unicorn-js/prefer-switch': ['error', { minimumCases: 3, emptyDefaultCase: 'no-default-comment' }],
    'unicorn-js/template-indent': ['error', { tags: ['outdent', 'dedent', 'gql', 'sql', 'html', 'styled'], functions: ['dedent', 'stripIndent'], selectors: [], comments: ['HTML', 'indent'] }],
};

// SonarJS is a small reliable core plus opt-in groups; every block is `{ rules, tests }`: `rules` apply to all files,
// `tests` go in a test-file override. All load through plugins/sonarjs-oxlint.mjs (per-file cache reset).
// Silent type-dependent rules (`sonarjsSilent`) and `void-use` are never enabled: JS plugins get no type information.
const sonar = names => levels('error', names.split(/\s+/u).filter(Boolean).map(name => `sonarjs/${name}`).join(' '));

// Core, general defect and security rules (non-test files). The last four also run on test files.
const sonarCoreGeneral = {
    ...sonar(`no-floating-point-equality no-hardcoded-ip no-identical-expressions no-duplicated-branches
        misplaced-loop-counter no-globals-shadowing pseudo-random no-ignored-exceptions file-permissions
        non-existent-operator no-invariant-returns inconsistent-function-call no-use-of-empty-return-value
        no-all-duplicated-branches no-unused-collection no-element-overwrite no-empty-collection weak-ssl
        no-weak-keys unverified-certificate no-clear-text-protocols publicly-writable-directories
        unverified-hostname encryption-secure-mode no-weak-cipher stateful-regex redundant-type-aliases
        memoize-cache-key avoid-mutating-nested-properties-of-shallow-clones anchor-precedence`),
    'sonarjs/cognitive-complexity': ['warn', 15],
    'sonarjs/regex-complexity': ['error', { threshold: 20 }],
    'sonarjs/no-hardcoded-passwords': ['error', { passwordWords: ['password', 'pwd', 'passwd', 'passphrase'] }],
    'sonarjs/no-hardcoded-secrets': ['error', { secretWords: 'api[_.-]?key,auth,credential,secret,token', randomnessSensibility: 5 }],
};
const sonarCoreShared = {
    ...sonar('no-os-command-from-path hashing no-internal-api-use'),
    'sonarjs/no-identical-functions': ['error', 3],
};
// Core, test-semantic rules (test files only).
const sonarCoreTests = sonar(`no-empty-test-file no-incomplete-assertions inverted-assertion-arguments
    parameterized-tests no-trivial-assertions async-test-assertions explicit-test-skip
    no-empty-parameterized-test-dataset no-duplicate-parameterized-test-case`);
export const sonarjs = {
    rules: { ...sonarCoreGeneral, ...sonarCoreShared },
    tests: {
        ...levels('off', Object.keys(sonarCoreGeneral).join(' ')),
        ...sonarCoreShared,
        ...sonarCoreTests,
    },
};

// Opt-in: AWS CDK / infrastructure rules.
export const sonarjsAws = {
    rules: sonar(`aws-apigateway-public-api aws-ec2-rds-dms-public aws-ec2-unencrypted-ebs-volume aws-efs-unencrypted
        aws-iam-all-privileges aws-iam-privilege-escalation aws-iam-public-access aws-opensearchservice-domain
        aws-rds-unencrypted-databases aws-restricted-ip-admin-access aws-s3-bucket-granted-access
        aws-s3-bucket-insecure-http aws-s3-bucket-public-access aws-s3-bucket-versioning
        aws-sagemaker-unencrypted-notebook aws-sns-unencrypted-topics aws-sqs-unencrypted-queue`),
    tests: {},
};

// Opt-in: web servers and general injection/secret-handling security (cookies, headers, HTTP libraries, XML, shells, SQL).
export const sonarjsWeb = {
    rules: {
        ...sonar(`content-security-policy cookie-no-httponly cors csrf file-uploads insecure-cookie insecure-jwt-token
            no-mime-sniff no-referrer-policy no-session-cookies-on-static-assets session-regeneration
            strict-transport-security x-powered-by xml-parser-xxe hardcoded-secret-signatures production-debug
            review-blockchain-mnemonic os-command sql-queries disabled-auto-escaping dompurify-unsafe-config
            hidden-files no-mixed-content frame-ancestors confidential-information-logging no-ip-forward`),
        'sonarjs/content-length': ['error', { fileUploadSizeLimit: 8000000, standardSizeLimit: 2000000 }],
        'sonarjs/no-intrusive-permissions': ['error', { permissions: ['geolocation'] }],
    },
    tests: {},
};

// Opt-in: React, Vue, Angular, jQuery, axios, HTML and JSX rules.
export const sonarjsFrameworks = {
    rules: sonar(`link-with-target-blank no-angular-bypass-sanitization no-debounce-throttle-in-render
        no-hook-setter-in-body no-mutate-reactive-state-in-updated-hook no-useless-react-setstate no-uniq-key
        no-vue-class-component no-vue-mixins prefer-native-axios-alternative prefer-native-jquery-alternative
        table-header table-header-reference no-table-as-layout object-alt-content dynamically-constructed-templates`),
    tests: {},
};

// Opt-in: chai, cypress, mocha, testing-library, vitest and other test-tool rules (test files only).
export const sonarjsTestTooling = {
    rules: {},
    tests: sonar(`chai-determinate-assertion disabled-timeout no-debug-commands-in-ui-tests no-fixed-wait-in-tests
        no-forced-browser-interaction no-interpolation-in-inline-snapshots no-same-argument-assert
        prefer-cypress-should testing-library-prefer-query-by-disappearance testing-library-query-assertion
        vitest-mock-at-module-scope assertions-in-tests no-incompatible-assertion-types
        synchronous-exception-assertions`),
};

// Opt-in: style and low-value rules, with the shared ESLint config's options.
export const sonarjsStyle = {
    rules: {
        ...sonar(`no-default-utility-imports no-inverted-boolean-check no-nested-assignment no-nested-template-literals
            no-same-line-conditional no-small-switch prefer-native-lodash-alternative prefer-promise-shorthand
            prefer-single-boolean-return prefer-type-guard prefer-while public-static-readonly updated-loop-counter
            use-type-alias no-commented-code arguments-order no-redundant-optional no-control-regex`),
        'sonarjs/class-name': ['error', { format: '^\\$?[A-Z][a-zA-Z0-9]*$' }],
        'sonarjs/max-switch-cases': ['error', 30],
        'sonarjs/no-nested-functions': ['error', { threshold: 5 }],
        'sonarjs/prefer-immediate-return': 'warn',
    },
    tests: sonar('prefer-specific-assertions stable-tests test-check-exception'),
};

// Dropped from every default: what covers each rule. Ids are Oxlint ids as enabled by this package; `bunTest:` ids are
// enabled by the optional bunTest export; `tsc:` entries are compiler diagnostics (keep a separate typecheck gate).
export const sonarjsCovered = {
    'assertions-in-test-cases': ['bunTest:jest-js/no-standalone-expect', 'bunTest:jest-js/expect-expect'],
    'block-scoped-var': ['block-scoped-var'],
    'call-argument-line': ['no-unexpected-multiline'],
    'code-eval': ['no-eval', 'typescript/no-implied-eval'],
    'empty-string-repetition': ['regexp/confusing-quantifier', 'regexp/no-trivially-nested-quantifier'],
    'fixme-tag': ['no-warning-comments'],
    'for-loop-increment-sign': ['for-direction'],
    'function-inside-loop': ['no-loop-func'],
    'future-reserved-words': ['tsc:TS1212,TS1213'],
    'generator-without-yield': ['require-yield'],
    'hooks-before-test-cases': ['bunTest:jest-js/prefer-hooks-on-top'],
    'no-case-label-in-switch': ['no-unused-labels'],
    'no-code-after-done': ['bunTest:jest-js/no-done-callback'],
    'no-collapsible-if': ['unicorn/no-lonely-if'],
    'no-dead-store': ['no-useless-assignment'],
    'no-delete-var': ['no-delete-var'],
    'no-duplicate-in-composite': ['typescript/no-duplicate-type-constituents'],
    'no-exclusive-tests': ['bunTest:jest-js/no-focused-tests'],
    'no-extra-arguments': ['tsc:TS2554'],
    'no-fallthrough': ['no-fallthrough'],
    'no-global-this': ['tsc:TS2683,TS7041'],
    'no-gratuitous-expressions': ['typescript/no-unnecessary-condition'],
    'no-identical-conditions': ['no-dupe-else-if', 'no-duplicate-case'],
    'no-implicit-global': ['no-undef'],
    'no-literal-call': ['tsc:TS2349'],
    'no-nested-conditional': ['no-nested-ternary', 'unicorn/no-nested-ternary'],
    'no-parameter-reassignment': ['no-param-reassign'],
    'no-primitive-wrappers': ['no-new-wrappers', 'typescript/no-wrapper-object-types'],
    'no-redundant-assignments': ['no-self-assign', 'no-useless-assignment'],
    'no-redundant-jump': ['no-useless-return'],
    'no-regex-spaces': ['no-regex-spaces'],
    'no-skipped-tests': ['bunTest:jest-js/no-disabled-tests'],
    'no-unenclosed-multiline-block': ['curly', 'no-unexpected-multiline'],
    'no-useless-catch': ['no-useless-catch'],
    'prefer-default-last': ['default-case-last'],
    'super-linear-regex': ['regexp/no-super-linear-backtracking', 'regexp/no-super-linear-move'],
    'todo-tag': ['no-warning-comments'],
    'updated-const-var': ['no-const-assign'],
    // Duplicates of built-ins that the default enables for exactly this purpose.
    'constructor-for-side-effects': ['no-new'],
    'no-unthrown-error': ['oxc/missing-throw'],
    // Previously enabled here; covered by the regexp plugin, native rules or the compiler.
    'unused-import': ['no-unused-vars'],
    'bitwise-operators': ['no-bitwise'],
    'no-empty-character-class': ['regexp/no-empty-character-class'],
    'slow-regex': ['regexp/no-super-linear-backtracking', 'regexp/no-super-linear-move'],
    'no-invalid-regexp': ['regexp/no-invalid-regexp'],
    'no-misleading-character-class': ['regexp/no-misleading-unicode-character'],
    'duplicates-in-character-class': ['regexp/no-dupe-characters-character-class'],
    'no-empty-after-reluctant': ['regexp/no-useless-lazy', 'regexp/no-lazy-ends'],
    'single-character-alternation': ['regexp/prefer-character-class'],
    'no-empty-alternatives': ['regexp/no-empty-alternative'],
    'no-empty-group': ['regexp/no-empty-group', 'regexp/no-empty-capturing-group'],
    'concise-regex': ['regexp/prefer-d', 'regexp/prefer-w', 'regexp/prefer-plus-quantifier', 'regexp/prefer-star-quantifier', 'regexp/prefer-question-quantifier'],
    'single-char-in-character-classes': ['regexp/no-useless-character-class'],
};
// Duplicates of a built-in rule that this package does NOT enable; the named built-in would cover them.
export const sonarjsNotCovered = {
    'label-position': 'no-labels',
    'no-duplicate-test-title': 'jest-js/no-identical-title',
    'no-empty-test-title': 'jest-js/valid-title',
    'no-labels': 'no-labels',
    'no-redundant-boolean': 'typescript/no-unnecessary-boolean-literal-compare (type-aware)',
    'synchronous-suite-callback': 'jest-js/valid-describe-callback',
};
// Ported to ast-grep (see the ast-grep directory).
export const sonarjsAstGrep = ['comma-or-logical-or-case', 'no-collection-size-mischeck', 'no-equals-in-for-termination', 'no-useless-increment', 'reduce-initial-value'];
// Silent without type information (or over-reporting, for void-use): never enabled.
export const sonarjsSilent = `deprecation no-ignored-return null-dereference no-selector-parameter index-of-compare-to-positive-number
    post-message no-array-delete no-alphabetical-sort new-operator-misuse different-types-comparison no-associative-arrays
    void-use argument-type in-operator-type-error array-callback-without-return function-return-type
    no-misleading-array-reverse no-useless-intersection no-in-misuse no-try-promise disabled-resource-integrity
    unused-named-groups existing-groups jsx-no-leaked-render prefer-regexp-exec prefer-read-only-props
    no-async-constructor`.split(/\s+/u);
export const eslintCore = {
    'eslint-core/dot-notation': ['warn', { allowKeywords: true, allowPattern: '' }],
    'eslint-core/require-atomic-updates': ['warn', { allowProperties: false }],
};
export const imports = {
    'import/no-duplicates': ['warn', { 'prefer-inline': true }],
    'import/no-self-import': 'error',
    'import/no-cycle': 'warn',
    'import/newline-after-import': 'warn',
    'import/no-mutable-exports': 'warn',
    'import/no-empty-named-blocks': 'warn',
    'import/no-anonymous-default-export': 'warn',
};
export const importsJs = {
    'import-x-js/no-useless-path-segments': 'warn',
    'import-x-js/order': ['warn', { groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'], 'newlines-between': 'never', alphabetize: { order: 'asc', caseInsensitive: true, orderImportKind: 'ignore' }, distinctGroup: true, sortTypesGroup: false, named: false, warnOnUnassignedImports: false }],
    'import-x-js/no-extraneous-dependencies': ['error', { devDependencies: ['**/*.test.*', '**/*.spec.*', '**/test/**', '**/scripts/**'] }],
};
export const testHygiene = errors(`@hughescr/test-hygiene/no-mock-module-in-test-body
    @hughescr/test-hygiene/require-fake-timers-cleanup @hughescr/test-hygiene/require-mock-cleanup
    @hughescr/test-hygiene/require-mock-reset`);
export const moduleBoundaries = errors(`@hughescr/module-boundaries/no-internal-in-barrel
    @hughescr/module-boundaries/no-star-export-from-non-barrel`);

// Differences from JavaScript. TypeScript extension rules use Oxlint core names.
export const typescript = {
    ...levels('off', `constructor-super getter-return no-class-assign no-const-assign no-dupe-class-members
        no-dupe-keys no-func-assign no-import-assign no-new-native-nonconstructor no-obj-calls no-setter-return
        no-this-before-super no-undef no-unreachable no-unsafe-negation no-with eslint-core/dot-notation
        no-throw-literal prefer-promise-reject-errors`),
    'no-shadow': 'warn',
    'no-unused-expressions': ['error', { allowShortCircuit: true, allowTaggedTemplates: false, allowTernary: true }],
    'no-var': 'error',
    'prefer-const': ['error', { destructuring: 'any', ignoreReadBeforeAssign: false }],
    ...errors(`prefer-rest-params prefer-spread typescript/await-thenable typescript/ban-ts-comment
        no-array-constructor typescript/no-array-delete typescript/no-base-to-string
        typescript/no-duplicate-enum-values typescript/no-duplicate-type-constituents typescript/no-empty-object-type
        typescript/no-explicit-any typescript/no-extra-non-null-assertion typescript/no-floating-promises
        typescript/no-for-in-array typescript/no-implied-eval typescript/no-misused-new typescript/no-misused-promises
        typescript/no-namespace typescript/no-non-null-asserted-optional-chain typescript/no-redundant-type-constituents
        typescript/no-require-imports typescript/no-this-alias typescript/no-unnecessary-type-assertion
        typescript/no-unnecessary-type-constraint typescript/no-unsafe-argument typescript/no-unsafe-assignment
        typescript/no-unsafe-call typescript/no-unsafe-declaration-merging typescript/no-unsafe-enum-comparison
        typescript/no-unsafe-function-type typescript/no-unsafe-member-access typescript/no-unsafe-return
        typescript/no-unsafe-unary-minus typescript/no-wrapper-object-types typescript/only-throw-error
        typescript/prefer-as-const typescript/prefer-namespace-keyword typescript/restrict-plus-operands
        typescript/restrict-template-expressions typescript/triple-slash-reference typescript/unbound-method
        typescript/adjacent-overload-signatures typescript/array-type typescript/ban-tslint-comment
        typescript/class-literal-property-style typescript/consistent-generic-constructors
        typescript/consistent-indexed-object-style typescript/consistent-type-assertions typescript/consistent-type-definitions
        typescript/no-confusing-non-null-assertion typescript/no-inferrable-types
        typescript/non-nullable-type-assertion-style typescript/prefer-find typescript/prefer-for-of
        typescript/prefer-function-type typescript/prefer-includes typescript/prefer-nullish-coalescing
        typescript/prefer-optional-chain typescript/prefer-regexp-exec typescript/prefer-string-starts-ends-with`),
    // Native typed replacements for silent SonarJS deprecation/alphabetical-sort rules.
    'typescript/no-deprecated': 'error',
    'typescript/require-array-sort-compare': ['error', { ignoreStringArrays: false }],
    'typescript/prefer-promise-reject-errors': 'warn',
    'typescript/dot-notation': ['warn', { allowIndexSignaturePropertyAccess: false, allowKeywords: true, allowPattern: '', allowPrivateClassPropertyAccess: false, allowProtectedClassPropertyAccess: false }],
    'no-empty-function': ['error', { allow: [] }],
    'typescript/consistent-type-imports': ['warn', { prefer: 'type-imports', fixStyle: 'inline-type-imports' }],
    'typescript/switch-exhaustiveness-check': 'warn',
    'typescript/return-await': ['warn', 'in-try-catch'],
    'typescript/no-unnecessary-condition': ['warn', { allowConstantLoopConditions: true }],
    'typescript/no-confusing-void-expression': ['warn', { ignoreArrowShorthand: true }],
    'typescript/no-misused-spread': 'warn',
    'typescript/no-unnecessary-template-expression': 'warn',
};
export const tests = levels('off', `require-yield unicorn/consistent-function-scoping
    sonarjs/no-hardcoded-passwords sonarjs/generator-without-yield sonarjs/publicly-writable-directories
    sonarjs/no-hardcoded-secrets typescript/no-unsafe-argument typescript/no-unsafe-assignment
    typescript/no-unsafe-call typescript/no-unsafe-member-access typescript/no-unsafe-return
    typescript/only-throw-error typescript/unbound-method no-empty-function typescript/no-misused-spread`);
