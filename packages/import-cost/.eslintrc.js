// eslint-disable-next-line unicorn/prefer-module,import/no-extraneous-dependencies
require('@rushstack/eslint-patch/modern-module-resolution');

const baseRuleOverrides = {
    'import/no-extraneous-dependencies': ['error', { devDependencies: ['**/rollup.config.js', '*.{js,mjs}', 'scripts/**'] }],
    'import/no-unresolved': ['error', { caseSensitive: false }],
    'no-console': ['error', { allow: ['warn', 'error'] }],
    radix: ['error', 'as-needed'],
    'no-invalid-this': 'off',
    'no-param-reassign': ['error', { props: false }],
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    // https://basarat.gitbooks.io/typescript/docs/tips/defaultIsBad.html
    'import/prefer-default-export': 'off',
    'import/no-default-export': 'error',
    'prefer-destructuring': ['error', { object: true, array: false }],
    'no-underscore-dangle': ['error', { allowAfterThis: true }],
    // Disable annoyances for now
    'no-void': ['error', { allowAsStatement: true }]
};

const tsRuleOverrides = {
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-comment': 'warn',
    '@typescript-eslint/no-use-before-define': ['error', { functions: false }],
    // Disable annoyances for now
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off'
};

/** @type {import('eslint/lib/shared/types').ConfigData} */
// eslint-disable-next-line unicorn/prefer-module
module.exports = {
    root: true,
    reportUnusedDisableDirectives: true,
    parserOptions: {
        project: ['./tsconfig.json', './packages/**/tsconfig.json'],
        // eslint-disable-next-line unicorn/prefer-module
        tsconfigRootDir: __dirname
    },
    overrides: [
        {
            files: ['*.js', '*.mjs'],
            extends: ['@psu/eslint-config-learner-engagement'],
            rules: {
                ...baseRuleOverrides
            }
        },
        {
            files: ['*.ts'],
            extends: ['@psu/eslint-config-learner-engagement/typescript'],
            rules: {
                ...baseRuleOverrides,
                ...tsRuleOverrides
            }
        }
    ]
};
