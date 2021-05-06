// eslint-disable-next-line unicorn/prefer-module,import/no-extraneous-dependencies
require('@rushstack/eslint-patch/modern-module-resolution');

/** @type {import('eslint/lib/shared/types').ConfigData} */
// eslint-disable-next-line unicorn/prefer-module
module.exports = {
    root: true,
    parserOptions: {
        project: ['./tsconfig.json', './packages/**/tsconfig.json'],
        // eslint-disable-next-line unicorn/prefer-module
        tsconfigRootDir: __dirname
    },
    overrides: [
        {
            files: ['*.js', '*.mjs'],
            extends: ['@bodrick/eslint-config']
        },
        {
            files: ['*.ts'],
            extends: ['@bodrick/eslint-config/typescript']
        }
    ]
};
