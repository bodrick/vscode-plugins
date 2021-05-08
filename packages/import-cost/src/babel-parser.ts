import { parse as jsParse, ParserPlugin } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

import { TYPESCRIPT } from './constants';

const PARSE_PLUGINS: ParserPlugin[] = [
    'jsx',
    // 'asyncFunctions',
    // 'classConstructorCall',
    'doExpressions',
    // 'trailingFunctionCommas',
    'objectRestSpread',
    ['decorators', { decoratorsBeforeExport: true }],
    'classProperties',
    // 'exportExtensions',
    // 'exponentiationOperator',
    'asyncGenerators',
    'functionBind',
    'functionSent',
    'dynamicImport'
];
const PARSE_JS_PLUGINS: ParserPlugin[] = ['flow', ...PARSE_PLUGINS];
const PARSE_TS_PLUGINS: ParserPlugin[] = ['typescript', ...PARSE_PLUGINS];

function compileImportString(node: any) {
    let importSpecifiers: string | undefined;
    const importString =
        node.specifiers.length > 0
            ? []
                  // eslint-disable-next-line unicorn/prefer-spread
                  .concat(node.specifiers)
                  .sort((s1: any, s2: any) => {
                      // Import specifiers are in statement order, which for mixed imports must be either "defaultImport, * as namespaceImport"
                      // or "defaultImport, { namedImport [as alias]... } according to current ECMA-262.
                      // Given that two equivalent import statements can only differ in the order of the items in a NamedImports block,
                      // we only need to sort these items in relation to each other to normalize the statements for caching purposes.
                      // Where the node is anything other than ImportSpecifier (Babel terminology for NamedImports), preserve the original statement order.
                      if (t.isImportSpecifier(s1) && t.isIdentifier(s1.imported) && t.isImportSpecifier(s2) && t.isIdentifier(s2.imported)) {
                          return s1.imported.name < s2.imported.name ? -1 : 1;
                      }
                      return 0;
                  })
                  .map((specifier: any, index) => {
                      if (t.isImportNamespaceSpecifier(specifier)) {
                          return `* as ${specifier.local.name}`;
                      }
                      if (t.isImportDefaultSpecifier(specifier)) {
                          return specifier.local.name;
                      }
                      if (t.isImportSpecifier(specifier)) {
                          if (!importSpecifiers) {
                              importSpecifiers = '{';
                          }
                          if (t.isStringLiteral(specifier.imported)) {
                              importSpecifiers += specifier.imported.value;
                          }
                          if (t.isIdentifier(specifier.imported)) {
                              importSpecifiers += specifier.imported.name;
                          }

                          if (node.specifiers[index + 1] && t.isImportSpecifier(node.specifiers[index + 1])) {
                              importSpecifiers += ', ';
                              // eslint-disable-next-line unicorn/no-useless-undefined
                              return undefined;
                          }
                          const result = `${importSpecifiers}}`;
                          importSpecifiers = undefined;
                          return result;
                      }
                      // eslint-disable-next-line unicorn/no-useless-undefined
                      return undefined;
                  })
                  .filter((x) => x)
                  .join(', ')
            : '* as tmp';
    return `import ${importString} from '${node.source.value}';\nconsole.log(${importString.replace('* as ', '')});`;
}

function getPackageName(node: object): string | undefined {
    if (t.isTemplateLiteral(node)) {
        return node.quasis[0].value.raw;
    }
    if (t.isCallExpression(node) && t.isStringLiteral(node.arguments[0])) {
        return node.arguments[0].value;
    }
    return undefined;
}

function compileRequireString(node: t.TemplateLiteral) {
    return `require('${getPackageName(node)}')`;
}

function compileImportExpressionString(node: t.TemplateLiteral) {
    return `import('${getPackageName(node)}').then(res => console.log(res));`;
}

function parse(source: any, language: string) {
    const plugins = language === TYPESCRIPT ? PARSE_TS_PLUGINS : PARSE_JS_PLUGINS;
    return jsParse(source, {
        sourceType: 'module',
        plugins
    });
}

export function getPackages(fileName: string, source: string, language: string, lineOffset = 0) {
    const packages: any[] = [];
    const visitor = {
        ImportDeclaration({ node }: any) {
            if (node.importKind !== 'type') {
                packages.push({
                    fileName,
                    name: node.source.value,
                    line: node.loc.end.line + lineOffset,
                    string: compileImportString(node)
                });
            }
        },
        CallExpression({ node }: any) {
            if (node.callee.name === 'require') {
                packages.push({
                    fileName,
                    name: getPackageName(node),
                    line: node.loc.end.line + lineOffset,
                    string: compileRequireString(node)
                });
            } else if (node.callee.type === 'Import') {
                packages.push({
                    fileName,
                    name: getPackageName(node),
                    line: node.loc.end.line + lineOffset,
                    string: compileImportExpressionString(node)
                });
            }
        }
    };

    const ast = parse(source, language);
    traverse(ast, visitor);
    return packages;
}
