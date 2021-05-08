/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const jsonParser = require('vscode-contrib-jsonc');

function collectChildDependencyNodes(nodes, collector) {
  nodes.forEach(node => {
    let replaceInfo = {
      start: node.value.start + 1,
      end: node.value.end - 1
    };

    // check if the node's value is an object
    if (node.type === 'object') {
      // collect replace info and value from child.version
      replaceInfo = extractChildReplaceRange(node.value.getChildNodes());
    }

    collector.push(createDependencyNode(node, replaceInfo));
  });
}

function extractChildReplaceRange(childNodes) {
  for (let i = 0; i < childNodes.length; i++) {
    let node = childNodes[i];
    if (node.key.value === 'version') {
      return {
        start: node.value.start + 1,
        end: node.value.end - 1,
        value: node.value.value
      };
    }
  }
}

export function findNodesInJsonContent(jsonContent, filterProperties) {
  const rootNode = findRootNode(jsonContent);
  if (!rootNode)
    return [];

  const dependencyNodes = extractDependencyNodes(
    rootNode,
    filterProperties
  );

  return dependencyNodes;
}

export function findRootNode(jsonContent) {
  const jsonDoc = jsonParser.parse(jsonContent);
  if (!jsonDoc || !jsonDoc.root || jsonDoc.validationResult.errors.length > 0)
    return null;

  return jsonDoc.root;
}

export function extractDependencyNodes(rootNode, filterList, collector = []) {
  rootNode.getChildNodes()
    .forEach(node => {
      // check if this node should be processed
      if (filterList.includes(node.key.value) === false)
        return;
      // collect the children
      const childNodes = node.value.getChildNodes();
      collectChildDependencyNodes(childNodes, collector);
    });

  return collector;
}

export function parseDependencyNodes(dependencyNodes, appContrib, customPackageParser = null) {
  const collector = [];

  dependencyNodes.forEach(
    function (node) {
      let result = null;
      if (customPackageParser) {
        const { name, value } = node;
        result = customPackageParser(name, value, appContrib);

        // ensure the result is a promise
        result = Promise.resolve(result)
          .then(function (packageOrPackages) {
            if (Array.isArray(packageOrPackages) === false)
              return [{ node, package: packageOrPackages }];

            return packageOrPackages.map(
              pkg => {
                return { node, package: pkg }
              }
            );
          });
      }

      if (!result)
        result = Promise.resolve({ node });

      collector.push(result);
    }
  );

  return collector;
}

export function createDependencyNode(node, replaceInfo) {
  if (!replaceInfo) {
    replaceInfo = {
      start: node.value.start + 1,
      end: node.value.end - 1,
    };
  }

  return {
    name: node.key.value,
    value: node.value.value,
    start: node.value.start,
    end: node.value.start,
    replaceInfo
  };
}