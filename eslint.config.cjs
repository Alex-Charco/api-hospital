const globals = require("globals");
const pluginJs = require("@eslint/js");

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: globals.node,  // Configura el entorno de Node.js
      ecmaVersion: "latest",
      sourceType: "commonjs",  // Asegura que ESLint entienda CommonJS
    },
  },
  pluginJs.configs.recommended
];
