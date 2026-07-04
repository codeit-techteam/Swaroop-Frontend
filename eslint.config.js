// @ts-check
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*', 'web-build/*'],
  },
  {
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-unused-vars': 'off',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
          pathGroups: [
            { pattern: '@/**', group: 'internal', position: 'before' },
            { pattern: 'react', group: 'external', position: 'before' },
            { pattern: 'react-native', group: 'external', position: 'before' },
            { pattern: 'expo**', group: 'external', position: 'before' },
          ],
          pathGroupsExcludedImportTypes: ['react', 'react-native'],
        },
      ],
    },
  },
]);
