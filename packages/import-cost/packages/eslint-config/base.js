/** @type {import('eslint/lib/shared/types').ConfigData} */
module.exports = {
    extends: [
        './rules/best-practices',
        './rules/errors',
        './rules/node',
        './rules/style',
        './rules/variables',
        './rules/es6',
        './rules/imports',
        './rules/strict',
        './rules/code-quality.js',
        './rules/security.js',
        './rules/prettier'
    ].map(require.resolve),
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module'
    }
};