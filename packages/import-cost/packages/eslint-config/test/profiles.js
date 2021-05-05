/* eslint-disable no-restricted-syntax */
/* eslint-disable global-require */
const test = require('ava');
const { CLIEngine } = require('eslint');

const configurations = ['base', 'typescript'];

for (const configuration of configurations) {
    // eslint-disable-next-line import/no-dynamic-require -- Safe as for testing
    const config = require(`../${configuration}`);

    const rulesDefinition = new CLIEngine({
        configFile: `./${configuration}.js`,
        useEslintrc: false
    }).getRules();

    const ruleNames = Object.keys(config.rules || []);

    for (const ruleName of ruleNames) {
        test(`plugin "${configuration}" has "${ruleName}" rule`, (tst) => {
            const pluginHasRule = rulesDefinition.has(ruleName);

            tst.true(pluginHasRule);
        });
    }

    test(`plugin "${configuration}" does not have "does-not-exist" rule`, (tst) => {
        const pluginHasRule = rulesDefinition.has('does-not-exist');

        tst.true(pluginHasRule === false);
    });
}
