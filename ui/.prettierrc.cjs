module.exports = {
  bracketSpacing: true,
  bracketSameLine: false,
  singleQuote: true,
  jsxSingleQuote: false,
  trailingComma: 'es5',
  semi: true,
  printWidth: 110,
  arrowParens: 'always',
  singleAttributePerLine: true,
  importOrder: ['^(react|clsx|cva)', '', '<THIRD_PARTY_MODULES>', '', '^@/(.*)$', '^[./]'],
  importOrderTypeScriptVersion: '5.0.0',
  plugins: ['@ianvs/prettier-plugin-sort-imports', 'prettier-plugin-tailwindcss'],
};
