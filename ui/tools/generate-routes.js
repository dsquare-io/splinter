import fs from 'node:fs';

import ts from 'typescript';

const verbRegex = /^(list|create|partialUpdate|update|retrieve|destroy)/i;

function extractPaths(filePath) {
  const program = ts.createProgram([filePath], {});

  const checker = program.getTypeChecker();

  const source = program.getSourceFile(filePath);

  const paths = new Map();

  ts.forEachChild(source, (rootNodes) => {
    if (!ts.isInterfaceDeclaration(rootNodes)) return;

    const symbol = checker.getSymbolAtLocation(rootNodes.name);
    if (symbol.name !== 'paths') return;

    ts.forEachChild(rootNodes, (pathInterfaceNodes) => {
      if (!ts.isPropertySignature(pathInterfaceNodes)) return;

      const path = checker.getSymbolAtLocation(pathInterfaceNodes.name).name;
      const operationNames = [];

      ts.forEachChild(pathInterfaceNodes.type, (operationsNode) => {
        if (!ts.isPropertySignature(operationsNode) || !ts.isIndexedAccessTypeNode(operationsNode.type))
          return;

        operationNames.push(operationsNode.type.indexType.literal.text);
      });

      let routeName = '';
      const routeOperations = new Set();

      let commonResource = operationNames[0];
      if (operationNames.length > 1) {
        // Find a resource name via the longest common camelCase-word suffix across all operations.
        // With multiple operations this reliably strips verbs (including non-standard ones).
        const wordSplits = operationNames.map((n) => n.split(/(?=[A-Z])/));
        let commonSuffixCount = 0;
        const first = wordSplits[0];
        for (let i = 1; i < first.length; i++) {
          const candidate = first.slice(first.length - i).join('');
          if (
            wordSplits.every(
              (words) => words.length > i && words.slice(words.length - i).join('') === candidate
            )
          ) {
            commonSuffixCount = i;
          } else {
            break;
          }
        }
        commonResource =
          commonSuffixCount > 0 ? wordSplits[0].slice(wordSplits[0].length - commonSuffixCount).join('') : '';
      }

      for (const operationName of operationNames) {
        const m = operationName.match(verbRegex);
        if (m) {
          routeOperations.add(m[1].toLowerCase());
        } else if (commonResource && operationName.endsWith(commonResource)) {
          const verb = operationName.slice(0, operationName.length - commonResource.length).toLowerCase();
          if (verb) routeOperations.add(verb);
        }

        const resourceName = m ? operationName.replace(verbRegex, '') : commonResource;
        if (resourceName.length > routeName.length) {
          routeName = resourceName;
        }
      }

      if (routeOperations.has('list')) {
        routeName = `${routeName}_list`;
      }

      if (
        path.replace(/\/$/, '').split('/').at(-1).includes('{') &&
        ['partialupdate', 'update', 'retrieve', 'destroy'].some((e) => routeOperations.has(e))
      ) {
        routeName = `${routeName}_detail`;
      }

      routeName = routeName.replace(/(([a-z])(?=[A-Z][a-zA-Z])|([A-Z])(?=[A-Z][a-z]))/g, '$1_').toUpperCase();

      paths.set(routeName, path);
    });
  });

  return new Map([...paths.entries()].sort());
}

/**
 * @param {Map<string, string>} paths
 * @param {string} recordName
 * @returns string
 */
function buildPathsRecord(paths, recordName) {
  const output = [`export const ${recordName} = {`];
  for (const [key, val] of paths.entries()) {
    output.push(`  ${key.replaceAll('-', '_')}: '${val}',`);
  }
  output.push('} as const;');
  return output.join('\n');
}

const routePaths = [['./src/api-types/routeTypes.d.ts', 'Paths']]
  .map(([filePath, recordName]) => buildPathsRecord(extractPaths(filePath), recordName))
  .join('\n\n');

fs.writeFileSync('./src/api-types/routePaths.ts', routePaths + '\n');
