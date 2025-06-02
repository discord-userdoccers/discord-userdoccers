import { defineConfig, globalIgnores } from "eslint/config";
import nextOnPages from "eslint-plugin-next-on-pages";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([globalIgnores(["dist/*", ".next/*", "**/*.js", "**/next-env.d.ts"]), {
    extends: compat.extends(
        "next",
        "next/core-web-vitals",
        "plugin:@typescript-eslint/recommended",
        "plugin:eslint-plugin-next-on-pages/recommended",
    ),

    plugins: {
        "next-on-pages": nextOnPages,
    },

    languageOptions: {
        ecmaVersion: 5,
        sourceType: "script",

        parserOptions: {
            project: "./tsconfig.eslint.json",
        },
    },

    rules: {
        "react/react-in-jsx-scope": 0,

        "react/jsx-filename-extension": [1, {
            extensions: [".tsx"],
        }],

        "no-eq-null": "off",
        "prefer-object-has-own": "off",
        "no-negated-condition": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-duplicate-imports": "off",
        "@typescript-eslint/ban-ts-comment": "warn",
    },
}]);