/** @type {import('eslint/lib/shared/types').ConfigData} */
module.exports = {
    extends: '../../.eslintrc.js',
    env: {
        mocha: true
    },
    rules: {
        'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
        'func-names': 'off',
        'max-classes-per-file': ['error', 4],
        'no-console': 'off',
        'no-continue': 'off',
        'no-param-reassign': 'off',
        'no-prototype-builtins': 'off',
        'no-underscore-dangle': 'off',
        'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
        'no-restricted-syntax': [
            'error',
            {
                selector: "CallExpression[callee.object.name='console'][callee.property.name!=/^(log|warn|error|info|trace)$/]",
                message: 'Unexpected property on console object was called'
            }
        ]
    }
};
