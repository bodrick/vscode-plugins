/** @type {import('eslint/lib/shared/types').ConfigData} */
module.exports = {
    plugins: ['unicorn', 'sonarjs'],
    extends: ['plugin:unicorn/recommended', 'plugin:sonarjs/recommended'],
    rules: {
        'sonarjs/cognitive-complexity': 'off'
    }
};
