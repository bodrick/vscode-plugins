const promises: Record<any, any> = {};

export const DebounceError = new Error('DebounceError');

export function debouncePromise(key: any, callback: any, delay = 500): any {
    const promise = new Promise((resolve, reject) => {
        setTimeout(() => (promises[key] === promise ? new Promise(callback).then(resolve).catch(reject) : reject(DebounceError)), delay);
    });
    // eslint-disable-next-line no-return-assign
    return (promises[key] = promise);
}
