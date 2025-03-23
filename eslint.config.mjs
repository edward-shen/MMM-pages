import eslintPluginJs from '@eslint/js';
import eslintPluginStylistic from '@stylistic/eslint-plugin';
import globals from 'globals';

const config = [
  eslintPluginJs.configs.recommended,
  eslintPluginStylistic.configs.recommended,
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      globals: {
        ...globals.browser,
        Log: 'readonly',
        MM: 'readonly',
        Module: 'readonly',
      },
    },
    rules: {
      '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
      '@stylistic/comma-dangle': ['error', 'only-multiline'],
      '@stylistic/semi': ['error', 'always'],
      'object-shorthand': ['error', 'always']
    },
  }
];

export default config;
