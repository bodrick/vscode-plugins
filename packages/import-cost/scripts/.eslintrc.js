/** @type {import('eslint/lib/shared/types').ConfigData} */
// eslint-disable-next-line unicorn/prefer-module
module.exports = {
    root: true,
    extends: '../.eslintrc.js',
    rules: {
        'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
        'no-console': 'off'
    }
};
