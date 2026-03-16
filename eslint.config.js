import { defineConfig, globalIgnores } from "eslint/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";

import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  globalIgnores([
    "dist/*",
    "**/*.js",
    "ci/*",
    "*.config.cjs",
    "*.config.mjs",
    "*.config.ts",
  ]),

  ...compat.extends(
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
  ),

  {
    plugins: {
      "@typescript-eslint": tsPlugin,
      "react": reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tsParser,
      parserOptions: {
        project: path.resolve(__dirname, "tsconfig.app.json"),
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "react/react-in-jsx-scope": 0,
      // This rule crashes the fucking linter
      "react/jsx-filename-extension": "off",
      "react-hooks/set-state-in-effect": "off",

      "sort-imports": [
        "error",
        {
          ignoreCase: true,
          ignoreDeclarationSort: true,
        },
      ],
      "no-eq-null": "off",
      "prefer-object-has-own": "off",
      "no-negated-condition": "off",

      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-duplicate-imports": "off",
    },
  },
]);
