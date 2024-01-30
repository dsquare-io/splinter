import ts from 'typescript';
import fs from 'node:fs';

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
        if (!ts.isPropertySignature(operationsNode)) return;

        operationNames.push(operationsNode.type.indexType.literal.text);
      });

      let routeName = '';
      const routeOperations = new Set();
      const regex = '^(list|create|partialUpdate|update|retrieve|destroy)';

      for (const operationName of operationNames) {
        const m = operationName.match(new RegExp(regex, 'i'));

        if (m) {
          routeOperations.add(m[1].toLowerCase());
        }

        const newRouteName = operationName.replaceAll(new RegExp(regex, 'gi'), '');

        if (newRouteName.length > routeName.length) {
          routeName = newRouteName;
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

      routeName = routeName.replace(/(([a-z])(?=[A-Z][a-zA-Z])|([A-Z])(?=[A-Z][a-z]))/g,'$1_').toUpperCase()

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

const routePaths = [
  ['./src/api-types/routeTypes.d.ts', 'Paths'],
]
  .map(([filePath, recordName]) => buildPathsRecord(extractPaths(filePath), recordName))
  .join('\n\n');

// eslint-disable-next-line prefer-template
fs.writeFileSync('./src/api-types/routePaths.ts', routePaths + '\n');
