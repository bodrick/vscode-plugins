import { cleanup, importCost, JAVASCRIPT, SVELTE, TYPESCRIPT, VUE } from 'import-cost';
import { commands, ExtensionContext, TextDocument, window, workspace } from 'vscode';

import { calculated, clearDecorations, flushDecorations } from './decorator';
import logger from './logger';

let isActive = true;

export function activate(context: ExtensionContext) {
    try {
        logger.init(context);
        logger.log('starting...');
        workspace.onDidChangeTextDocument((event) => isActive && processActiveFile(event.document));
        window.onDidChangeActiveTextEditor((event) => event && isActive && processActiveFile(event.document));
        if (window.activeTextEditor && isActive) {
            processActiveFile(window.activeTextEditor.document);
        }

        context.subscriptions.push(
            commands.registerCommand('importCost.toggle', () => {
                isActive = !isActive;
                if (isActive && window.activeTextEditor) {
                    processActiveFile(window.activeTextEditor.document);
                } else {
                    deactivate();
                    clearDecorations();
                }
            })
        );
    } catch (error) {
        logger.log(`wrapping error: ${error}`);
    }
}

export function deactivate() {
    cleanup();
}

let emitters = {};
async function processActiveFile(document: TextDocument) {
    if (document && language(document)) {
        const { fileName } = document;
        if (emitters[fileName]) {
            emitters[fileName].removeAllListeners();
        }
        const { timeout } = workspace.getConfiguration('importCost');
        emitters[fileName] = importCost(fileName, document.getText(), language(document), { concurrent: true, maxCallTime: timeout });
        emitters[fileName].on('error', (e) => logger.log(`importCost error: ${e}`));
        emitters[fileName].on('start', (packages) => flushDecorations(fileName, packages));
        emitters[fileName].on('calculated', (packageInfo) => calculated(packageInfo));
        emitters[fileName].on('done', (packages) => flushDecorations(fileName, packages));
    }
}

function language({ fileName, languageId }) {
    if (languageId === 'Log') {
        return;
    }
    const configuration = workspace.getConfiguration('importCost');
    const typescriptRegex = new RegExp(configuration.typescriptExtensions.join('|'));
    const javascriptRegex = new RegExp(configuration.javascriptExtensions.join('|'));
    const vueRegex = new RegExp(configuration.vueExtensions.join('|'));
    const svelteRegex = new RegExp(configuration.svelteExtensions.join('|'));
    if (languageId === 'svelte' || svelteRegex.test(fileName)) {
        return SVELTE;
    } else if (languageId === 'vue' || vueRegex.test(fileName)) {
        return VUE;
    } else if (languageId === 'typescript' || languageId === 'typescriptreact' || typescriptRegex.test(fileName)) {
        return TYPESCRIPT;
    } else if (languageId === 'javascript' || languageId === 'javascriptreact' || javascriptRegex.test(fileName)) {
        return JAVASCRIPT;
    } else {
        return undefined;
    }
}
