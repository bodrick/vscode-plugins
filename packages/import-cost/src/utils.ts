import fs from 'fs';
import path from 'path';
import pkgDir from 'pkg-dir';

export function parseJson(directory: string) {
    const packagePath = path.join(directory, 'package.json');
    return JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
}
export function getPackageName(packageName: string) {
    const scopedPackageRegex = /((?:@\w+\/))?(?<package>[\w-.]+)/;
    return scopedPackageRegex.exec(packageName)?.groups?.package ?? packageName;
}

/**
 * @param {Object} pkg
 * @returns {string} The location of a node_modules folder containing this package.
 */
export function getPackageModuleContainer(package_: any) {
    let currentDirectory = path.dirname(package_.fileName);
    let foundDirectory = '';
    const packageName = getPackageName(package_);

    while (!foundDirectory) {
        const projectDirectory = pkgDir.sync(currentDirectory);
        if (!projectDirectory) {
            throw new Error(`Package directory not found [${package_.name}]`);
        }
        const modulesDirectory = path.join(projectDirectory, 'node_modules');
        if (fs.existsSync(path.resolve(modulesDirectory, packageName))) {
            foundDirectory = modulesDirectory;
        } else {
            currentDirectory = path.resolve(currentDirectory, '..');
        }
    }
    return foundDirectory;
}

/**
 * @param {Object} pkg
 * @returns {string} The actual location on-disk for this package.
 */
export function getPackageDirectory(package_: any) {
    const packageName = getPackageName(package_);

    const temporary = getPackageModuleContainer(package_);
    return path.resolve(temporary, packageName);
}

export function getPackageJson(package_: any) {
    return parseJson(getPackageDirectory(package_));
}

export function getPackageVersion(package_: any) {
    return `${getPackageName(package_)}@${getPackageJson(package_).version}`;
}
