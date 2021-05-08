import fs from 'fs';
import path from 'path';
import pkgDir from 'pkg-dir';

export interface Package {
    fileName: string;
    name: string;
}

export function parseJson(directory: string) {
    const packagePath = path.join(directory, 'package.json');
    return JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
}

export function getPackageName(packageDetails: Package) {
    const scopedPackageRegex = /((?:@\w+\/))?(?<package>[\w-.]+)/;
    return scopedPackageRegex.exec(packageDetails.name)?.groups?.package ?? packageDetails.name;
}

/**
 * @param {Package} packageDetails
 * @returns {string} The location of a node_modules folder containing this package.
 */
export function getPackageModuleContainer(packageDetails: Package): string {
    let currentDirectory = path.dirname(packageDetails.fileName);
    let foundDirectory = '';
    const packageName = getPackageName(packageDetails);

    while (!foundDirectory) {
        const projectDirectory = pkgDir.sync(currentDirectory);
        if (!projectDirectory) {
            throw new Error(`Package directory not found [${packageDetails.name}]`);
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
 * @param {Package} packageDetails
 * @returns {string} The actual location on-disk for this package.
 */
export function getPackageDirectory(packageDetails: Package): string {
    const packageName = getPackageName(packageDetails);
    const temporary = getPackageModuleContainer(packageDetails);
    return path.resolve(temporary, packageName);
}

export function getPackageJson(packageDetails: Package) {
    return parseJson(getPackageDirectory(packageDetails));
}

export function getPackageVersion(packageDetails: Package) {
    return `${getPackageName(packageDetails)}@${getPackageJson(packageDetails).version}`;
}
