import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import eslint from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import { defineConfig } from 'eslint/config'
import importPlugin from 'eslint-plugin-import'
import reactA11y from 'eslint-plugin-jsx-a11y'
import importSort from 'eslint-plugin-simple-import-sort'
import tseslint from 'typescript-eslint'

const importSortGroups = [
  [
    '^node:',
  ],
  [
    'react',
    '^@?\\w',
  ],
  [
    '^types(/.*)?\\u0000?$',
    '^\\./types(/.*)?\\u0000?$',
    '^\\.\\./types(/.*)?\\u0000?$',
    '^.*/types(/.*)?\\u0000?$',
  ],
  [
    '^(backend|services)(/.*|$)',
  ],
  [
    '^(libraries)(/.*|$)',
    '^(components|pages|utils|i18n)(/.*|$)',
  ],
  [
    '^',
  ],
  [
    '^\\.',
  ],
  [
    '^\\u0000',
  ],
]

export default defineConfig(
  { ignores: ['dist', '.vite', 'src/types/gql/*.ts'] },
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylisticTypeChecked,
  stylistic.configs['recommended-flat'],
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  {
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  reactHooks.configs.flat['recommended-latest'],
  reactA11y.flatConfigs.recommended,
  {
    plugins: {
      'simple-import-sort': importSort,
      import: importPlugin,
    },
    languageOptions: {
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest',
        projectService: {
          allowDefaultProject: ['eslint.config.js'],
        },
      },
    },
    rules: {
      // --- TODO Fix these eventually somehow
      'react-hooks/refs': 0,
      'react-hooks/set-state-in-effect': 1,
      'react/prop-types': 0,
      '@typescript-eslint/no-empty-function': 0,
      // --- TODO Check if these are sane
      '@stylistic/operator-linebreak': 0,
      '@stylistic/indent-binary-ops': 0,
      '@stylistic/arrow-parens': 0,
      '@stylistic/multiline-ternary': 0,
      '@stylistic/indent': 0,
      // ---

      /* Style stuff */
      'no-trailing-spaces': ['error'],
      'comma-dangle': ['error', 'only-multiline'],
      'comma-spacing': 1,
      indent: ['error', 2, { SwitchCase: 1 }],
      'linebreak-style': ['error', 'unix'],
      quotes: ['error', 'single'],
      semi: ['error', 'never'],
      '@stylistic/max-statements-per-line': [1, { max: 2 }],
      '@stylistic/jsx-closing-tag-location': [1, 'line-aligned'],
      '@stylistic/quote-props': [1, 'as-needed'],
      '@stylistic/jsx-max-props-per-line': [0, { maximum: { single: 3, multi: 1 } }],
      '@stylistic/member-delimiter-style': ['error', {
        multiline: { delimiter: 'none', requireLast: true },
        singleline: { delimiter: 'comma', requireLast: false },
      }],
      '@stylistic/brace-style': [2, '1tbs', { allowSingleLine: true }],

      /** Import ordering */
      'simple-import-sort/imports': [
        'error',
        { groups: importSortGroups },
      ],
      'simple-import-sort/exports': 'error',
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',

      /* Prevent potential bugs */
      'no-template-curly-in-string': 2,
      'no-unreachable': 2,
      '@typescript-eslint/no-explicit-any': 1,
      '@typescript-eslint/no-non-null-assertion': 1,
      '@typescript-eslint/no-unused-vars': ['warn', {
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
      }],

      /** Intentionally disabled rules */
      'react/display-name': 0,
      'react/no-children-prop': 0,
      '@typescript-eslint/no-inferrable-types': 0,
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/non-nullable-type-assertion-style': 0,
      '@typescript-eslint/prefer-regexp-exec': 0,
      '@stylistic/jsx-wrap-multilines': 0,
      '@stylistic/jsx-first-prop-new-line': 0,
      '@stylistic/jsx-one-expression-per-line': 0,
      '@stylistic/jsx-closing-bracket-location': 0,
      '@stylistic/jsx-curly-newline': 0,
    },
  },

)

// export default tseslint.config(
//   {
//     languageOptions: {
//       ecmaVersion: 2020,
//       // globals: globals.browser,
//       parserOptions: {
//         project: ['./tsconfig.node.json', './tsconfig.app.json'],
//       },
//     },
//     rules: {
//       ...reactHooks.configs.recommended.rules,
//       'no-void': [0],
//       '@typescript-eslint/no-confusing-void-expression': [
//         'error',
//         { ignoreArrowShorthand: true },
//      ],
//       '@typescript-eslint/restrict-template-expressions': [
//         'error', {
//           allowNumber: true,
//         },
//      ],
//       '@typescript-eslint/no-use-before-define': [
//         'error', {
//           functions: false,
//           classes: true,
//           variables: true,
//           allowNamedExports: false,
//         }],
//       'react/react-in-jsx-scope': [0],
//       'react/require-default-props': [0],
//       'react/no-unstable-nested-components': [0],
//       'import-x/prefer-default-export': [0],
//       }],
//     },
//   },
// )
