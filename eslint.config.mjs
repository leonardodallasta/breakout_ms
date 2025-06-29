import js from "@eslint/js";
import globals from "globals";

export default [
  {
    files: ["main.js", "electron/**/*.js"],  // Node/Electron files
    languageOptions: {
      ecmaVersion: 2021,
      globals: globals.node,
    },
    extends: [
      "plugin:sonarjs/recommended",
      "plugin:@eslint/js/recommended",
    ],
  },
  {
    files: ["public/**/*.js", "renderer/**/*.js"],  // Frontend files
    languageOptions: {
      ecmaVersion: 2021,
      globals: globals.browser,
    },
    extends: [
      "plugin:sonarjs/recommended",
      "plugin:@eslint/js/recommended",
    ],
  },
];
