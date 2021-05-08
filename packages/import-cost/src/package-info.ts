/* eslint-disable unicorn/prefer-module */
import fs from 'fs';
import os from 'os';
import path from 'path';
import pkgDir from 'pkg-dir';
import workerFarm from 'worker-farm';

import { DebounceError, debouncePromise } from './debounce-promise';
import { getPackageVersion, parseJson } from './utils';
import * as webpack from './webpack';

const MAX_WORKER_RETRIES = 3;
const MAX_CONCURRENT_WORKERS = os.cpus().length - 1;

const debug = process.env.NODE_ENV === 'test';
let workers: workerFarm.Workers;

function initWorkers(maxCallTime?: number) {
    return workerFarm(
        {
            maxConcurrentWorkers: debug ? 1 : MAX_CONCURRENT_WORKERS,
            maxRetries: MAX_WORKER_RETRIES,
            maxCallTime: maxCallTime || Number.POSITIVE_INFINITY
        },
        require.resolve('./webpack'),
        ['calcSize']
    );
}
const packagePath = pkgDir.sync(__dirname);
if (packagePath === undefined) {
    throw new Error('Unable to get package path');
}

const extensionVersion = parseJson(packagePath).version;
let sizeCache: Record<string, any> = {};
const versionsCache: Record<string, any> = {};
const failedSize = { size: 0, gzip: 0 };
export const cacheFileName = path.join(__dirname, `ic-cache-${extensionVersion}`);

function readSizeCache() {
    try {
        if (Object.keys(sizeCache).length === 0 && fs.existsSync(cacheFileName)) {
            sizeCache = JSON.parse(fs.readFileSync(cacheFileName, 'utf-8'));
        }
    } catch {
        // silent error
    }
}

function calcPackageSize(packageInfo: any, config: any) {
    if (workers === undefined) {
        workers = initWorkers(config);
    }

    return debouncePromise(`${packageInfo.fileName}#${packageInfo.line}`, (resolve: any, reject: any) => {
        const calcSize = config.concurrent ? workers.calcSize : webpack.calcSize;
        calcSize(packageInfo, (error: any, result: any) => (error ? reject(error) : resolve(result)));
    });
}

function saveSizeCache() {
    try {
        const keys = Object.keys(sizeCache).filter((key) => {
            const size = sizeCache[key] && sizeCache[key].size;
            return typeof size === 'number' && size > 0;
        });
        // eslint-disable-next-line unicorn/no-array-reduce
        const cache = keys.reduce((object, key) => ({ ...object, [key]: sizeCache[key] }), {});
        if (Object.keys(cache).length > 0) {
            fs.writeFileSync(cacheFileName, JSON.stringify(cache, undefined, 2), 'utf-8');
        }
    } catch {
        // silent error
    }
}

export async function getSize(package_: any, config: any) {
    readSizeCache();
    try {
        versionsCache[package_.string] = versionsCache[package_.string] || getPackageVersion(package_);
    } catch {
        return { ...package_, ...failedSize };
    }

    const key = `${package_.string}#${versionsCache[package_.string]}`;
    if (sizeCache[key] === undefined || sizeCache[key] instanceof Promise) {
        try {
            sizeCache[key] = sizeCache[key] || calcPackageSize(package_, config);
            sizeCache[key] = await sizeCache[key];
            saveSizeCache();
        } catch (error) {
            if (error === DebounceError) {
                delete sizeCache[key];
                throw error;
            } else {
                sizeCache[key] = failedSize;
                return { ...package_, ...sizeCache[key], error };
            }
        }
    }
    return { ...package_, ...sizeCache[key] };
}

export function clearSizeCache() {
    sizeCache = {};
    if (fs.existsSync(cacheFileName)) {
        fs.unlinkSync(cacheFileName);
    }
}

export function cleanup() {
    if (workers) {
        workerFarm.end(workers);
    }
}
