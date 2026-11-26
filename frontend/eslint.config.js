import { readdirSync } from 'node:fs';

import js from '@eslint/js';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { globalIgnores } from 'eslint/config';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import sonarjs from 'eslint-plugin-sonarjs';
import react from 'eslint-plugin-react';
import pluginQuery from '@tanstack/eslint-plugin-query';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importX from 'eslint-plugin-import-x';

// Import direction, as documented in frontend/CLAUDE.md:
// pages/ → features/ → components/, context/, shared/, and between features only products → my-lists
const ALLOWED_FEATURE_IMPORTS = { products: ['my-lists'] };
const features = readdirSync(`${import.meta.dirname}/src/features`);

const importZones = [
  {
    target: ['./src/components', './src/context', './src/shared'],
    from: ['./src/features', './src/pages'],
    message: 'components/, context/ and shared/ never import from features/ or pages/.',
  },
  {
    target: './src/features',
    from: ['./src/pages', './src/routes'],
    message: 'features/ never import from pages/ or routes/.',
  },
  ...features.map((feature) => ({
    target: `./src/features/${feature}`,
    from: './src/features',
    except: [feature, ...(ALLOWED_FEATURE_IMPORTS[feature] ?? [])].map((name) => `./${name}`),
    message: 'Features import each other only in the documented direction (products → my-lists).',
  })),
];

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      react.configs.flat.recommended,
      jsxA11y.flatConfigs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
      sonarjs.configs.recommended,
      ...pluginQuery.configs['flat/recommended-strict'],
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      react: { version: 'detect' },
      // Without these, import-x skips .ts/.tsx dependencies and no-cycle sees nothing
      'import-x/extensions': ['.ts', '.tsx'],
      'import-x/parsers': { '@typescript-eslint/parser': ['.ts', '.tsx'] },
      'import-x/resolver-next': [
        createTypeScriptImportResolver({ project: `${import.meta.dirname}/tsconfig.app.json` }),
      ],
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
      'import-x': importX,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      'import-x/no-cycle': 'error',
      // Checks the written path, so `@/` imports pass and only `../` segments fail
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '(^|/)[.][.](/|$)',
              message: 'Use the @/ alias. Only sibling ./ imports stay relative.',
            },
          ],
        },
      ],
      'import-x/no-restricted-paths': [
        'error',
        { basePath: import.meta.dirname, zones: importZones },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    rules: {
      'react/react-in-jsx-scope': 'off',
    },
  },
]);
