const globals = require("globals");
const pluginJs = require("@eslint/js");

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: globals.node, 
      ecmaVersion: "latest",
      sourceType: "commonjs", 
    },
  },
  pluginJs.configs.recommended
];
