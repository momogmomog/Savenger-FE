// @ts-check
const prettierPlugin = require("eslint-plugin-prettier");
const typescriptParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const angularPlugin = require("@angular-eslint/eslint-plugin");
const eslintPluginPrettierRecommended = require("eslint-plugin-prettier/recommended");
module.exports = [
  {
    ignores: [
      ".cache/",
      ".git/",
      ".github/",
      "node_modules/",
      "build/",
      "**.html",
      "android/",
      ".nx/",
      ".angular/",
      ".vscode/",
      "www/",
      "src/app/app-routing.path.ts",
      "src/app/shared/http/endpoints.ts",
    ],
  },

  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: [
          "./tsconfig.json",
          "./tsconfig.app.json",
          "./tsconfig.spec.json",
        ],
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "@angular-eslint": angularPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...angularPlugin.configs.recommended.rules,
      ...prettierPlugin.configs?.rules,
      "@angular-eslint/directive-selector": [
        "warn",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "warn",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
      "import/order": "off",
      "@typescript-eslint/no-explicit-any": ["off"],
      "@typescript-eslint/member-ordering": 0,
      "@typescript-eslint/naming-convention": 0,
      "@angular-eslint/no-host-metadata-property": "off",
      "@angular-eslint/no-output-on-prefix": "off",
      "@typescript-eslint/ban-types": "off",
      "@typescript-eslint/no-inferrable-types": "error",
      "@typescript-eslint/explicit-function-return-type": "error",
    },
  },
  // Lint for HTML files
  // {
  //   files: ["**/*.html"],
  //   languageOptions: {
  //     parser: angularTemplateParser,
  //   },
  //   plugins: {
  //     "@angular-eslint": angularPlugin,
  //     "@angular-eslint/template": angularPlugin,
  //     prettier: prettierPlugin,
  //   },
  //   rules: {
  //     "prettier/prettier": ["error", { parser: "angular" }],
  //   },
  // },
  eslintPluginPrettierRecommended,
];
