import { EventEmitter } from 'events';

import { getSize } from './package-info';
import { getPackages } from './parser';

export { cleanup } from './package-info';

// eslint-disable-next-line unicorn/no-object-as-default-parameter
export function importCost(fileName: string, text: string, language: string, config = { maxCallTime: Number.POSITIVE_INFINITY, concurrent: true }) {
    const emitter = new EventEmitter();
    setTimeout(async () => {
        try {
            const imports = getPackages(fileName, text, language).filter((packageInfo) => !packageInfo.name.startsWith('.'));
            emitter.emit('start', imports);
            const promises = imports
                .map((packageInfo) => getSize(packageInfo, config))
                .map((promise) =>
                    promise.then((packageInfo) => {
                        emitter.emit('calculated', packageInfo);
                        return packageInfo;
                    })
                );
            const packages = (await Promise.all(promises)).filter((x) => x);
            emitter.emit('done', packages);
        } catch (error) {
            emitter.emit('error', error);
        }
    }, 0);
    return emitter;
}
