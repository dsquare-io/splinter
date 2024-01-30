module.exports = {
  bracketSpacing: false,
  bracketSameLine: false,
  singleQuote: true,
  jsxSingleQuote: false,
  trailingComma: 'es5',
  semi: true,
  printWidth: 110,
  arrowParens: 'always',
  singleAttributePerLine: true,
  importOrder: ['^(react|clsx|cva)', '<THIRD_PARTY_MODULES>', '^@/(.*)$', '^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  plugins: [
    '@trivago/prettier-plugin-sort-imports',
    'prettier-plugin-tailwindcss',
    // require.resolve('@ianvs/prettier-plugin-sort-imports'),
    // '@ianvs/prettier-plugin-sort-imports',
    // require('./tools/merged-prettier-plugin.cjs')
  ],
};
