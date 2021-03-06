/* eslint-disable unicorn/prefer-module, sonarjs/no-duplicate-string */
import 'jest-extended';

import fs from 'fs';
import path from 'path';

import { cleanup, importCost as runner } from '../src';
import { JAVASCRIPT, LANGUAGES } from '../src/constants';
import { DebounceError } from '../src/debounce-promise';
import { cacheFileName, clearSizeCache } from '../src/package-info';

declare let wallaby: any;

const DEFAULT_CONFIG = {
    concurrent: false,
    maxCallTime: Number.POSITIVE_INFINITY
};

const workingFolder = typeof wallaby !== 'undefined' ? path.join(wallaby.localProjectDir, 'test') : __dirname;
function fixture(fileName: string) {
    return path.join(workingFolder, 'fixtures', fileName);
}

function whenDone(emitter: any): Promise<any> {
    return new Promise((resolve, reject) => {
        let start: string | any[];
        const calculated = [];
        emitter.on('start', (packages: string | any[]) => {
            expect(start).toBeUndefined();
            start = packages;
        });
        emitter.on('calculated', (packages: any) => calculated.push(packages));
        emitter.on('done', (packages: string | any[]) => {
            expect(start.length).toBe(packages.length);
            expect(calculated.length).toBe(packages.length);
            resolve(packages);
        });
        emitter.on('error', reject);
    });
}

function importCost(fileName: string, language?: string, config = DEFAULT_CONFIG) {
    if (!language) {
        const extension = path.parse(fileName).ext.replace('.', '');
        language = LANGUAGES[extension];
    }
    return runner(fileName, fs.readFileSync(fileName, 'utf-8'), language, config);
}

function sizeOf(packages: any[], name: string) {
    return packages.find((x) => x.name === name).size;
}

function gzipOf(packages: any[], name: string) {
    return packages.find((x) => x.name === name).gzip;
}

function getPackages(fileName: string): Promise<any[]> {
    return whenDone(importCost(fixture(fileName)));
}

async function test(fileName: string, package_ = 'chai', minSize = 10000, maxSize = 15000, gzipLowBound = 0.01, gzipHighBound = 0.8) {
    const packages = await getPackages(fileName);
    const size = sizeOf(packages, package_);
    expect(size).toBeGreaterThanOrEqual(minSize);
    expect(size).toBeLessThanOrEqual(maxSize);
    expect(gzipOf(packages, package_)).toBeGreaterThanOrEqual(size * gzipLowBound);
    expect(gzipOf(packages, package_)).toBeLessThanOrEqual(size * gzipHighBound);
}

async function timed(function_: {
    (): Promise<void>;
    (): Promise<void>;
    (): Promise<void>;
    (): Promise<void>;
    (): Promise<void>;
    (): Promise<void>;
    (): Promise<void>;
    (): Promise<void>;
    (): Promise<void>;
    (): Promise<void>;
    (): Promise<void>;
    (): Promise<void>;
    (): Promise<void>;
    (): Promise<void>;
    (): Promise<void>;
    (): Promise<void>;
    (): Promise<void>;
    (): Promise<void>;
    (): Promise<void>;
    (): Promise<void>;
    (): Promise<void>;
    (): Promise<void>;
    (): Promise<void>;
    (): Promise<void>;
    (): Promise<void>;
    (): Promise<void>;
    (): Promise<void>;
    (): Promise<void>;
    (): any;
}) {
    const time = process.hrtime();
    await function_();
    const diff = process.hrtime(time);
    return Math.round((diff[0] * 1e9 + diff[1]) / 1e6);
}

describe('importCost', () => {
    beforeEach(() => clearSizeCache());
    afterEach(() => clearSizeCache());
    afterEach(() => cleanup());

    // it.only('local file', async () => {
    //   const result = await whenDone(importCost(path.join(workingFolder, 'index.spec.js'), JAVASCRIPT));
    //   console.log(result[0].error);
    //   debugger;
    // });

    it('calculates size of require in javascript', () => test('require.js'));
    it('calculates size of require in typescript', () => test('require.ts'));
    it('calculates size of template require in javascript', () => test('require-template.js'));
    it('calculates size of template require in typescript', () => test('require-template.ts'));
    it('calculates size of import in javascript', () => test('import.js'));
    it('calculates size of import in typescript', () => test('import.ts'));
    it('calculate size of imports in a file contaning typescript features not supportted by babel', () => test('typescript-not-supported-features.ts'));
    it('calculates size of aliased import in javascript', () => test('import-aliased.js'));
    it('calculates size of aliased import in typescript', () => test('import-aliased.ts'));
    it('calculates size of import with no semicolon in typescript', () => test('import-no-semicolon.ts'));
    it('calculates size of legacy import in javascript', () => test('import-legacy.js'));
    it('calculates size of legacy import in typescript', () => test('import-legacy.ts'));
    it('doesnt calculate size of node import in javascript', () => test('import-node.js', 'node-stuff', 0, 0));
    it('calculates size of namespace import in javascript', () => test('import-namespace.js'));
    it('calculates size of imports in a file with shorthand react fragments', () => test('react-fragments.jsx'));
    it('calculates size of namespace import in typescript', () => test('import-namespace.ts'));
    it('calculates size of specifiers import in javascript', () => test('import-specifiers.js'));
    it('calculates size of specifiers import in typescript', () => test('import-specifiers.ts'));
    it('calculates size of mixed default+named import in javascript', () => test('import-mixed.js'));
    it('calculates size of mixed default+named import in typescript', () => test('import-mixed.ts'));
    it('calculates size of mixed default+global import in javascript', () => test('import-global-mixed.js', 'react'));
    it('calculates size of mixed default+global import in typescript', () => test('import-global-mixed.ts', 'react'));
    it('calculates size of cherry pick import in javascript', () => test('import-cherry.js', 'chai/abc'));
    it('calculates size of cherry pick import in typescript', () => test('import-cherry.ts', 'chai/abc'));
    it('calculates size of scoped import in javascript', () => test('import-scoped.js', '@angular/core'));
    it('calculates size of scoped import in typescript', () => test('import-scoped.ts', '@angular/core'));
    it('calculates size of scoped esm import in javascript', () => test('import-scoped-esm.js', '@angular/core/esm'));
    it('calculates size of scoped esm import in typescript', () => test('import-scoped-esm.ts', '@angular/core/esm'));
    it('calculates size of shaken import in javascript', () => test('import-shaken.js', 'react', 350, 450));
    it('calculates size of shaken import in typescript', () => test('import-shaken.ts', 'react', 350, 450));
    it('calculates size of production env import in javascript', () => test('import-env.js', 'react-dom', 350, 450));
    it('calculates size of production env import in typescript', () => test('import-env.ts', 'react-dom', 350, 450));
    it('calculates size without externals', () => test('import-externals.js', 'wix-style', 350, 450));
    it('calculates size without peerDependencies', () => test('import-peer.js', 'haspeerdeps', 350, 450));
    it('supports a monorepo-like structure', () => test('./yarn-workspace/import-nested-project.js', 'chai'));
    it('supports a monorepo-like structure with scoped module', () => test('./yarn-workspace/import-with-scope.js', '@angular/core'));
    it('supports a monorepo-like structure with scoped module and file name', () => test('./yarn-workspace/import-with-scope-filename.js', '@angular/core/index.js'));
    it('calculates size of a dynamic import in javascript', () => test('dynamic-import.js'));
    it('calculates size of a dynamic import in typescript', () => test('dynamic-import.ts'));
    it('calculates size of a vue script', () => test('vue.vue'));
    it('calculates size of a svelte script', () => test('svelte.svelte'));

    it('caches the results import string & version', async () => {
        expect(await timed(() => test('import.js'))).toBeGreaterThanOrEqual(100);
        expect(await timed(() => test('import.js'))).toBeLessThanOrEqual(1500);
        expect(await timed(() => test('import-specifiers.js'))).toBeGreaterThanOrEqual(100);
        expect(await timed(() => test('import-specifiers.js'))).toBeLessThanOrEqual(1500);
        expect(await timed(() => test('import.ts'))).toBeGreaterThanOrEqual(0);
        expect(await timed(() => test('import.ts'))).toBeLessThanOrEqual(100);
    });
    it('ignores order of javascript imports for caching purposes', async () => {
        expect(await timed(() => test('import-specifiers.js'))).toBeGreaterThanOrEqual(100);
        expect(await timed(() => test('import-specifiers.js'))).toBeLessThanOrEqual(1500);
        expect(await timed(() => test('import-specifiers-reversed.js'))).toBeGreaterThanOrEqual(0);
        expect(await timed(() => test('import-specifiers-reversed.js'))).toBeLessThanOrEqual(100);
        expect(await timed(() => test('import-mixed.js'))).toBeGreaterThanOrEqual(100);
        expect(await timed(() => test('import-mixed.js'))).toBeLessThanOrEqual(1500);
        expect(await timed(() => test('import-mixed-reversed.js'))).toBeGreaterThanOrEqual(0);
        expect(await timed(() => test('import-mixed-reversed.js'))).toBeLessThanOrEqual(120);
    });
    it('ignores order of typescript imports for caching purposes', async () => {
        expect(await timed(() => test('import-specifiers.ts'))).toBeGreaterThanOrEqual(100);
        expect(await timed(() => test('import-specifiers.ts'))).toBeLessThanOrEqual(1500);
        expect(await timed(() => test('import-specifiers-reversed.ts'))).toBeGreaterThanOrEqual(0);
        expect(await timed(() => test('import-specifiers-reversed.ts'))).toBeLessThanOrEqual(100);
        expect(await timed(() => test('import-mixed.ts'))).toBeGreaterThanOrEqual(100);
        expect(await timed(() => test('import-mixed.ts'))).toBeLessThanOrEqual(1500);
        expect(await timed(() => test('import-mixed-reversed.ts'))).toBeGreaterThanOrEqual(0);
        expect(await timed(() => test('import-mixed-reversed.ts'))).toBeLessThanOrEqual(100);
    });
    it('debounce any consecutive calculations of same import line', () => {
        const p1 = expect(whenDone(runner(fixture('import.js'), 'import "chai";', JAVASCRIPT, DEFAULT_CONFIG))).rejects.toMatch(DebounceError.message);
        const p2 = expect(whenDone(runner(fixture('import.js'), 'import "chai/index";', JAVASCRIPT, DEFAULT_CONFIG))).toReject();
        return Promise.all([p1, p2]);
    });
    it('caches everything to filesystem', async () => {
        expect(await timed(() => test('import.js'))).toBeGreaterThanOrEqual(100);
        expect(await timed(() => test('import.js'))).toBeLessThanOrEqual(1500);
        expect(await timed(() => test('import-specifiers.js'))).toBeGreaterThanOrEqual(100);
        expect(await timed(() => test('import-specifiers.js'))).toBeLessThanOrEqual(1500);
        fs.renameSync(cacheFileName, `${cacheFileName}.bak`);
        clearSizeCache();
        fs.renameSync(`${cacheFileName}.bak`, cacheFileName);
        expect(await timed(() => test('import.ts'))).toBeGreaterThanOrEqual(0);
        expect(await timed(() => test('import.ts'))).toBeLessThanOrEqual(100);
    });

    it('results in 0 if dependency is missing', async () => {
        const packages = await whenDone(importCost(fixture('failed-missing.js')));
        expect(sizeOf(packages, 'sinon')).toBe(0);
    });
    it('results in 0 if bundle fails', async () => {
        const packages = await whenDone(importCost(fixture('failed-bundle.js')));
        expect(sizeOf(packages, 'jest')).toBe(0);
    });

    it('errors on broken javascript', () => {
        return expect(whenDone(importCost(fixture('incomplete.bad.js')))).toReject();
    });
    it('errors on broken typescript', () => {
        return expect(whenDone(importCost(fixture('incomplete.bad.ts')))).toReject();
    });
    it('errors on broken vue', () => {
        return expect(whenDone(importCost(fixture('incomplete.bad.vue')))).toReject();
    });
    it('completes with empty array for unknown file type', async () => {
        const packages = await whenDone(importCost(fixture('require.js'), 'flow'));
        expect(packages).toEqual([]);
    });

    it('should handle timeouts gracefully', async () => {
        const packages = await whenDone(
            importCost(fixture('require.js'), JAVASCRIPT, {
                concurrent: true,
                maxCallTime: 10
            })
        );
        expect(packages[0].size).toBe(0);
        expect(packages[0].error.type).toBe('TimeoutError');
    });
});
