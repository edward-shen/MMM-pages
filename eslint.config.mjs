import eslintPluginJs from "@eslint/js";
import eslintPluginStylistic from "@stylistic/eslint-plugin";
import globals from "globals";

const config = [
  {
    files: ["**/*.js", "**/*.mjs"],
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        Log: "readonly",
        MM: "readonly",
        Module: "readonly",
      },
    },
    plugins: {
      ...eslintPluginStylistic.configs["all-flat"].plugins,
    },
    rules: {
      ...eslintPluginJs.configs.all.rules,
      ...eslintPluginStylistic.configs["all-flat"].rules,
      "@stylistic/array-element-newline": "off",
      "@stylistic/brace-style": ["error", "1tbs", { allowSingleLine: true }],
      "@stylistic/comma-dangle": ["error", "only-multiline"],
      "@stylistic/dot-location": ["error", "property"],
      "@stylistic/function-call-argument-newline": "off",
      "@stylistic/indent": ["error", 2],
      "@stylistic/max-statements-per-line": ["error", { max: 2 }],
      "@stylistic/object-curly-spacing": "off",
      "@stylistic/padded-blocks": "off",
      "@stylistic/quote-props": ["error", "consistent-as-needed"],
      "init-declarations": "off",
      "@stylistic/quotes": ["error", "double"],
      "@stylistic/multiline-comment-style": "off",
      "@stylistic/multiline-ternary": "off",
      "capitalized-comments": "off",
      "consistent-this": "off",
      "max-lines": "off",
      "max-lines-per-function": "off",
      "max-statements": "off",
      "no-empty-function": "off",
      "no-inline-comments": "off",
      "no-magic-numbers": "off",
      "no-negated-condition": "off",
      "no-ternary": "off",
      "no-undefined": "off",
      "one-var": "off",
      "sort-keys": "off",
    },
  }
];

export default config;
