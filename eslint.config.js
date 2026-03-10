import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': 'off',
      // Prohibir console.log y debugger en commits
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "no-shadow": "error",
      "max-lines": ["warn", { "max": 500, "skipBlankLines": true }],
      "complexity": ["error", 15],
      "no-multiple-empty-lines": ["error", { "max": 1 }],
      // Forzar comillas simples
      'no-unused-vars': ['error', { vars: 'all', args: 'after-used', ignoreRestSiblings: true, varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
      quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../**', './**'], // Bloquea rutas relativas
              message:
                "Por favor, usa el alias '@/' para las importaciones en lugar de rutas relativas.",
            },
          ],
        },
      ],
    },
  },
  // emails/ is a self-contained React Email project; relative imports are standard there
  {
    files: ['**/emails/**/*.ts', '**/emails/**/*.tsx'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
])

