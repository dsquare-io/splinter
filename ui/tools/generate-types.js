import fs from 'node:fs';
import openapiTS from 'openapi-typescript';

if (!fs.existsSync('./src/api-types')) {
  fs.mkdirSync('./src/api-types');
}

if (!fs.existsSync('./src/api-types/components')) {
  fs.mkdirSync('./src/api-types/components');
}

const schemas = new Map();

function resolveComponentSchemaPath(schema, useImport = false) {
  const match = schema.match(/components\[["'](\w+)["']\]\[["'](\w+)["']\]/);

  if (match) {
    if (match[1] === 'schemas') {
      return useImport ? `import('./components/schemas').${match[2]}` : match[2];
    }
  }

  return schema;
}

function splitSchemaPostTransform(schema, options) {
  if (options.path.includes('/components/schemas') && options.ctx.indentLv === 2) {
    if (schema.startsWith('import')) return undefined;

    const name = options.path.split('/').at(-1);

    schema = resolveComponentSchemaPath(schema);
    schema = schema.replaceAll(/^\s{4}/gm, '');

    const existingSchemas = schemas.get(name) ?? [];
    if (!existingSchemas.includes(schema)) {
      existingSchemas.push(schema);
    }
    schemas.set(name, existingSchemas);

    return `import('./components/schemas.d.ts').${name}`;
  }
  return resolveComponentSchemaPath(schema, !options.path.includes('#/components/schemas'));
}

console.log('Fetching schema...');
const commonRouteTypes = await openapiTS('http://localhost:8000/api/schema', {
  postTransform: splitSchemaPostTransform,
});
fs.writeFileSync('./src/api-types/routeTypes.d.ts', commonRouteTypes);

const routeSchemaTypes = Array.from(schemas.entries())
  .map(([name, schemaUnions]) => {
    const isInterface = schemaUnions.length === 1 && schemaUnions[0].match(/^\s*\{/);
    return isInterface
      ? `export interface ${name} ${schemaUnions[0]}\n`
      : `export type ${name} = ${schemaUnions.join(' | ')};\n`;
  })
  .join('\n');

fs.writeFileSync('./src/api-types/components/schemas.d.ts', `${routeSchemaTypes}\n`);
