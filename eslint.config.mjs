import { defineConfig, globalIgnores } from "eslint/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

import nextPlugin from "@next/eslint-plugin-next";
import nextOnPages from "eslint-plugin-next-on-pages";
import tsPlugin from "@typescript-eslint/eslint-plugin";
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
  {
    extends: compat.extends(
      "plugin:@typescript-eslint/recommended",
      "plugin:eslint-plugin-next-on-pages/recommended",
      "plugin:react-hooks/recommended",
    ),

    plugins: {
      "@next/next": nextPlugin,
      "next-on-pages": nextOnPages,
      "@typescript-eslint": tsPlugin,
      "react": reactPlugin,
      "react-hooks": reactHooksPlugin,
    },

    languageOptions: {
      ecmaVersion: 5,
      sourceType: "script",

      parserOptions: {
        project: path.resolve(__dirname, "tsconfig.eslint.json"),
      },
    },

    rules: {
      "react/react-in-jsx-scope": 0,

      "react/jsx-filename-extension": [
        1,
        {
          extensions: [".tsx"],
        },
      ],
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
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-duplicate-imports": "off",
      "@typescript-eslint/ban-ts-comment": "warn",
    },
  },
]);
