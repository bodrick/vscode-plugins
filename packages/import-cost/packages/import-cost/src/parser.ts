import cheerio from 'cheerio';

import { getPackages as getPackagesFromJS } from './babel-parser';

export const TYPESCRIPT = 'typescript';
export const JAVASCRIPT = 'javascript';
export const VUE = 'vue';
export const SVELTE = 'svelte';

function extractScriptFromHtml(html: string) {
    try {
        const $ = cheerio.load(html);
        return $('script').html();
    } catch (error) {
        console.error(`ERR`, error);
        return '';
    }
}

function getScriptTagLineNumber(html: string) {
    const splitted = html.split('\n');
    for (const [index, element] of splitted.entries()) {
        if (/<script/.test(element)) {
            return index;
        }
    }
    return 0;
}

export function getPackages(fileName: string, source: string, language: string) {
    if ([SVELTE, VUE].includes(language)) {
        const scriptSource = extractScriptFromHtml(source);
        const scriptLine = getScriptTagLineNumber(source);
        return getPackagesFromJS(fileName, scriptSource, TYPESCRIPT, scriptLine);
    }
    return [TYPESCRIPT, JAVASCRIPT].includes(language) ? getPackagesFromJS(fileName, source, language) : [];
}
