import path from 'path';

console.log(JSON.stringify(import.meta));

const moduleURL = new URL(import.meta.url);
console.log(`pathname ${moduleURL.pathname}`);
console.log(`dirname ${path.dirname(moduleURL.pathname)}`);

const __dirname = path.dirname(moduleURL.pathname);

console.log(__dirname);
