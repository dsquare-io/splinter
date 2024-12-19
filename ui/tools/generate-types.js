import fs from 'node:fs';
import openapiTS from 'openapi-typescript';
import {Project, ts} from 'ts-morph';

/////////////
// Constants

const OAPI_SCHEMA_URL = 'http://localhost:8000/api/schema';
const ROUTE_TYPES_FILE = './src/api-types/routeTypes.d.ts';
const SCHEMA_TYPES_FILE = './src/api-types/components/schemas.d.ts';
const builtinNames = ['Object'];

/////////////////
// Ensure directories

if (!fs.existsSync('./src/api-types')) {
  fs.mkdirSync('./src/api-types');
}

if (!fs.existsSync('./src/api-types/components')) {
  fs.mkdirSync('./src/api-types/components');
}

/////////////////
// Fetch schema

console.log('Fetching schema...');
const commonRouteTypes = await openapiTS(OAPI_SCHEMA_URL);
fs.writeFileSync(ROUTE_TYPES_FILE, commonRouteTypes);

////////////////
// Transform schema

const project = new Project();

const routeTypesFile = project.addSourceFileAtPath(ROUTE_TYPES_FILE);
const schemasFile = project.createSourceFile(SCHEMA_TYPES_FILE, '', {
  overwrite: true,
});

const componentsInterface = routeTypesFile.getInterface('components').getProperty('schemas');

/** @type {import('ts-morph').PropertySignature[]} */
const SchemasProperties = componentsInterface.getTypeNode().getProperties();

for (const property of SchemasProperties) {
  const structure = property.getStructure();
  const name = builtinNames.includes(structure.name) ? structure.name + '_' : structure.name;

  if (property.getTypeNode().isKind(ts.SyntaxKind.TypeLiteral)) {
    const _interface = schemasFile.addInterface({
      name: name,
      docs: structure.docs,
      isExported: true,
    });

    for (const prop of property.getTypeNode().getProperties()) {
      _interface.addMember(
        prop
          .getFullText()
          .trim()
          .replaceAll(/components\["schemas"]\["(\w+)"]/g, (_, name) => {
            return builtinNames.includes(name) ? name + '_' : name;
          })
      );
    }
  } else {
    schemasFile.addTypeAlias({
      name: name,
      isExported: true,
      type: structure.type.replaceAll(/components\["schemas"]\["(\w+)"]/g, (_, name) => {
        return builtinNames.includes(name) ? name + '_' : name;
      }),
    });
  }

  property.set({
    type: (w) => w.write(`import("./components/schemas.d.ts").${name}`),
  });
}

schemasFile.formatText({});
schemasFile.save().then();
routeTypesFile.save().then();
