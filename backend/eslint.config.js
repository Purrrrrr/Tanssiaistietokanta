import eslint from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import importPlugin from 'eslint-plugin-import'
import importSort from 'eslint-plugin-simple-import-sort'
import tseslint from 'typescript-eslint'

const importSortGroups = [
  [
    '^node:',
  ],
  [
    '^@?\\w',
  ],
  [
    '^types(/.*)?\\u0000?$',
    '^\\./types(/.*)?\\u0000?$',
    '^\\.\\./types(/.*)?\\u0000?$',
    '^.*/types(/.*)?\\u0000?$',
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

export default tseslint.config(
  { ignores: ['lib', 'node_modules', 'public'] },
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylisticTypeChecked,
  stylistic.configs['recommended-flat'],
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
      // TODO: Maybe re-enable some day
      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/prefer-nullish-coalescing': 1,
      '@typescript-eslint/no-empty-object-type': 0,
      /*
    178 @stylistic/object-curly-spacing
    108 @typescript-eslint/no-explicit-any
    */

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
      '@stylistic/quote-props': [1, 'as-needed'],
      '@stylistic/member-delimiter-style': ['error', {
        multiline: { delimiter: 'none', requireLast: true },
        singleline: { delimiter: 'comma', requireLast: false },
      }],
      '@stylistic/brace-style': [2, '1tbs', { allowSingleLine: true }],

      /** Import ordering */
      // 'simple-import-sort/imports': [
      //   'error',
      //   { groups: importSortGroups },
      // ],
      'simple-import-sort/exports': 'error',
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',

      /* Prevent potential bugs */
      'no-template-curly-in-string': 2,
      'no-unreachable': 2,
      '@typescript-eslint/no-non-null-assertion': 1,
      '@typescript-eslint/no-unused-vars': ['warn', {
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
      }],

      /** Intentionally disabled rules */
      '@typescript-eslint/no-inferrable-types': 0,
      '@typescript-eslint/no-empty-function': 0,
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/non-nullable-type-assertion-style': 0,
      '@typescript-eslint/prefer-regexp-exec': 0,
    },
  },
)
