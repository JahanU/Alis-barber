import js from '@eslint/js'; // Core ESLint recommended rules
import globals from 'globals'; // Predefined global variables for different environments
import reactHooks from 'eslint-plugin-react-hooks'; // React Hooks specific linting rules
import reactRefresh from 'eslint-plugin-react-refresh'; // React Refresh specific linting rules for Vite
import tsParser from '@typescript-eslint/parser'; // TypeScript parser for ESLint
import tsPlugin from '@typescript-eslint/eslint-plugin'; // TypeScript specific linting rules plugin
import { defineConfig, globalIgnores } from 'eslint/config'; // Utility to define ESLint configuration and handle global ignores

export default defineConfig([
  globalIgnores([
    'dist',
    'node_modules',
    'public',
    '.netlify',
    'netlify/.netlify',
  ]),
  ...tsPlugin.configs['flat/recommended'],
  {
    files: [
      'src/**/*.{js,ts,tsx}',
      'netlify/functions/**/*.{js,ts}',
    ], // Files to apply this configuration to
    // Extended configurations
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    // Plugins to load
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    // Language and environment options
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      // Define global variables
      globals: {
        ...globals.browser,
        ...globals.node,
        // Test environment globals
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        vi: 'readonly',
      },
    },
    // Custom rules overrides
    rules: {
      // Disable the base ESLint unused vars rule in favor of the TypeScript-aware version.
      'no-unused-vars': 'off',
      // TypeScript specific unused variables rule with ignore patterns
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^[A-Z_]',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true, // Allow unused variables when destructuring
        },
      ],
      // Disable React Refresh component export rule if needed (set to 'off' here)
      'react-refresh/only-export-components': 'off',
      semi: ['error', 'always'],
      // indent: ['error', 'tab'],
    },
  },
]);
