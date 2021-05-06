/* eslint-disable unicorn/no-null, unicorn/prefer-module */
module.exports = {
    extends: [require.resolve('stylelint-config-sass-guidelines'), require.resolve('stylelint-prettier/recommended')],
    rules: {
        'selector-no-qualifying-type': null,
        'selector-max-compound-selectors': null,
        'max-nesting-depth': null
    },
    reportNeedlessDisables: true,
    reportInvalidScopeDisables: true
};
