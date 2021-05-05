/** @type {import('eslint/lib/shared/types').ConfigData} */
module.exports = {
    root: true,
    extends: './base.js',
    rules: {
        'import/no-extraneous-dependencies': ['error', { devDependencies: ['**/test/**'] }],
        'func-names': 'off',
        'unicorn/prefer-module': 'off',
        'no-secrets/no-secrets': 'off',
        'sonarjs/no-duplicate-string': 'off'
    }
};
