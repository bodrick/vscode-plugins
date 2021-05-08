/* eslint-disable sonarjs/no-duplicate-string */
import path from 'path';

import { getPackageDirectory, getPackageModuleContainer } from '../src/utils';

const pathSegments = [process.cwd(), 'tests', 'fixtures'];

jest.mock('pkg-dir', () => ({
    sync: () => {}
}));

describe('utils', () => {
    describe('getPackageDirectory', () => {
        it('should handle simple directory structure', () => {
            const packageDetails = {
                fileName: path.resolve(...pathSegments, 'import.js'),
                name: 'chai'
            };
            console.log(packageDetails);
            expect(getPackageDirectory(packageDetails)).toEqual(path.resolve(...pathSegments, 'node_modules', 'chai'));
        });

        it('should handle a nested project structure', () => {
            const packageDetails = {
                fileName: path.resolve('fixtures', 'yarn-workspace', 'import-nested-project.js'),
                name: 'chai'
            };
            expect(getPackageDirectory(packageDetails)).toEqual(path.resolve('fixtures', 'node_modules', 'chai'));
        });

        it('should handle a nested project structure, with scoped package', () => {
            const packageDetails = {
                fileName: path.resolve('fixtures', 'yarn-workspace', 'import-with-scope.js'),
                name: '@angular/core'
            };
            expect(getPackageDirectory(packageDetails)).toEqual(path.resolve('fixtures', 'node_modules', '@angular', 'core'));
        });

        it('should handle a nested project structure, with scoped package and filename', () => {
            const packageDetails = {
                fileName: path.resolve('fixtures', 'yarn-workspace', 'import-with-scope-filename.js'),
                name: '@angular/core/index.js'
            };
            expect(getPackageDirectory(packageDetails)).toEqual(path.resolve('fixtures', 'node_modules', '@angular', 'core'));
        });

        it('should bail out when project directory is not found', () => {
            const packageDetails = {
                fileName: path.resolve('fixtures', 'import.js'),
                name: 'chai'
            };
            const exception = 'Package directory not found [chai]';
            expect(() => getPackageDirectory(packageDetails)).toThrowError(exception);
        });
    });

    describe('getPackageModuleContainer', () => {
        it('should return the node_modules dir in the basic case', () => {
            const packageDetails = {
                fileName: path.resolve('fixtures', 'import.js'),
                name: 'chai'
            };
            expect(getPackageModuleContainer(packageDetails)).toEqual(path.resolve('fixtures', 'node_modules'));
        });

        it('should return the node_modules dir for nested project structure', () => {
            const packageDetails = {
                fileName: path.resolve('fixtures', 'yarn-workspace', 'import-nested-project.js'),
                name: 'chai'
            };
            expect(getPackageModuleContainer(packageDetails)).toEqual(path.resolve('fixtures', 'node_modules'));
        });
    });
});
