import fs from 'node:fs';
import openapiTS from 'openapi-typescript';
import {Project, ts} from 'ts-morph';

/////////////
// Constants

const OAPI_SCHEMA_URL = 'http://localhost:8000/api/schema';
const ROUTE_TYPES_FILE = './src/api-types/routeTypes.d.ts';
const SCHEMA_TYPES_FILE = './src/api-types/components/schemas.d.ts';


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

  property.set({
    type: (w) => w.write(`import("./components/schemas.d.ts").${structure.name}`)
  });

  if (ts.isTypeLiteralNode(property.getTypeNode().compilerNode)) {
    const _interface = schemasFile.addInterface({
      name: structure.name,
      docs: structure.docs,
      isExported: true,
    });

    for (const prop of property.getTypeNode().getProperties()) {
      _interface.addMember(prop.getFullText().trim());
    }
  } else {
    schemasFile.addTypeAlias({
      name: structure.name,
      isExported: true,
      type: structure.type,
    });
  }
}

schemasFile.formatText({});
schemasFile.save().then();
routeTypesFile.save().then()
