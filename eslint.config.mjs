import { defineConfig } from 'eslint/config';
import globals from 'globals';
import js from '@eslint/js';
import markdown from '@eslint/markdown';
import stylistic from '@stylistic/eslint-plugin';

export default defineConfig([
  {
    files: ['**/*.js'],
    ignores: ['tests/**/*.test.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.browser,
        Log: 'readonly',
        MM: 'readonly',
        Module: 'readonly',
        module: 'readonly',
      },
    },
    plugins: { js },
    extends: ['js/recommended', stylistic.configs.recommended],
    rules: {
      '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
      '@stylistic/comma-dangle': ['error', 'only-multiline'],
      '@stylistic/max-statements-per-line': ['error', { max: 2 }],
      '@stylistic/semi': ['error', 'always'],
      'no-negated-condition': 'error'
    }
  },
  {
    files: ['tests/**/*.test.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.node,
        Log: 'readonly',
        MM: 'readonly',
        Module: 'readonly',
      },
    },
    plugins: { js },
    extends: ['js/recommended', stylistic.configs.recommended],
    rules: {
      '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
      '@stylistic/comma-dangle': ['error', 'only-multiline'],
      '@stylistic/max-statements-per-line': ['error', { max: 2 }],
      '@stylistic/semi': ['error', 'always'],
      'no-negated-condition': 'error'
    }
  },
  { files: ['**/*.md'], plugins: { markdown }, language: 'markdown/gfm', extends: ['markdown/recommended'] },
]);
