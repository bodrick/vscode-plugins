/** @type {import('eslint/lib/shared/types').ConfigData} */
module.exports = {
    plugins: ['no-secrets', 'no-unsanitized'],
    rules: {
        'no-secrets/no-secrets': 'error',
        'no-unsanitized/method': 'error',
        'no-unsanitized/property': 'error'
    }
};
