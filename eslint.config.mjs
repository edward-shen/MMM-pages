import eslintPluginJs from '@eslint/js';
import eslintPluginStylistic from '@stylistic/eslint-plugin';
import globals from 'globals';

const config = [
  {
    files: ['**/*.js', '**/*.mjs'],
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        Log: 'readonly',
        MM: 'readonly',
        Module: 'readonly',
      },
    },
    plugins: {
      ...eslintPluginStylistic.configs['all-flat'].plugins,
    },
    rules: {
      ...eslintPluginJs.configs.recommended.rules,
      ...eslintPluginStylistic.configs['all-flat'].rules,
      '@stylistic/array-element-newline': 'off',
      '@stylistic/brace-style': ['error', '1tbs', {allowSingleLine: true}],
      '@stylistic/comma-dangle': ['error', 'only-multiline'],
      '@stylistic/dot-location': ['error', 'property'],
      '@stylistic/function-call-argument-newline': 'off',
      '@stylistic/indent': ['error', 2],
      '@stylistic/padded-blocks': 'off',
      '@stylistic/quote-props': ['error', 'consistent-as-needed'],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/multiline-comment-style': 'off',
      '@stylistic/multiline-ternary': 'off',
    },
  }
];

export default config;
