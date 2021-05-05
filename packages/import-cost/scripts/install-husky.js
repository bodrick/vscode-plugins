const path = require(`path`);
const execa = require('execa');
const ci = require('ci-info');

const projectPath = path.resolve(__dirname, `..`);

const options = {
    cwd: projectPath
};
try {
    if (!ci.isCI) {
        console.log('Installing husky hooks');

        const { stdout } = execa.commandSync('husky install', options);
        console.log(stdout);

        execa.commandSync('shx rm -rf .git/hooks', options);
        execa.commandSync('shx ln -s ../.husky .git/hooks', options);
    } else {
        console.log('The name of the CI server is:', ci.name);
    }
} catch (error) {
    console.log(error);
}
