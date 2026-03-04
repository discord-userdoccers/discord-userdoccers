import { defineConfig, globalIgnores } from "eslint/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

import nextPlugin from "@next/eslint-plugin-next";
import nextOnPages from "eslint-plugin-next-on-pages";
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
    ".next/*",
    "**/*.js",
    "**/next-env.d.ts",
    "ci/*",
    "*.config.cjs",
    "*.config.mjs",
    "*.config.ts",
  ]),

  ...compat.extends(
    "plugin:@typescript-eslint/recommended",
    "plugin:eslint-plugin-next-on-pages/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@next/next/recommended",
    "plugin:@next/next/core-web-vitals",
  ),

  {
    plugins: {
      "@next/next": nextPlugin,
      "next-on-pages": nextOnPages,
      "@typescript-eslint": tsPlugin,
      "react": reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tsParser,
      parserOptions: {
        project: path.resolve(__dirname, "tsconfig.eslint.json"),
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
      "@next/next/no-html-link-for-pages": "error",

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
