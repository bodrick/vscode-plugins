/** @type {import('eslint').Linter.Config} */
module.exports = {
    extends: '../.eslintrc.js',
    env: {
        jest: true
    },
    rules: {
        'no-empty': 'off',
        '@typescript-eslint/naming-convention': 'off',
        'import/no-unresolved': 'off',
        'import/no-extraneous-dependencies': 'off',
        'unicorn/prevent-abbreviations': 'off'
    }
};
