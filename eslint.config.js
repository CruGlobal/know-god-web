import angularEslintPlugin from '@angular-eslint/eslint-plugin';
import angularEslintTemplatePlugin from '@angular-eslint/eslint-plugin-template';
import * as path from 'path';
import eslintPluginImport from 'eslint-plugin-import';
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import eslintPluginPrettier from 'eslint-plugin-prettier';

export default [
  {
    ignores: ['dist/**']
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: [path.resolve('tsconfig.json')],
        createDefaultProgram: true
      }
    },
    plugins: {
      '@angular-eslint': angularEslintPlugin,
      import: eslintPluginImport,
      '@typescript-eslint': typescriptEslintPlugin,
      prettier: eslintPluginPrettier
    },
    settings: {
      'import/resolver': {
        node: {
          // Allows to import url starting from 'src'
          paths: ['.'],
          extensions: ['.js', '.ts', '.d.ts']
        }
      }
    },

    rules: {
      ...eslintPluginImport.configs.errors.rules,
      ...eslintPluginImport.configs.warnings.rules,
      ...eslintPluginImport.configs.typescript.rules,
      ...typescriptEslintPlugin.configs.recommended.rules,
      ...angularEslintPlugin.configs.recommended.rules,
      'prettier/prettier': 'error',
      '@angular-eslint/component-selector': [
        'error',
        {
          prefix: 'app',
          style: 'kebab-case',
          type: 'element'
        }
      ],
      '@angular-eslint/directive-selector': [
        'error',
        {
          prefix: 'app',
          style: 'camelCase',
          type: 'attribute'
        }
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
      ],
      'import/no-duplicates': 'error',
      'import/extensions': 'error',
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type'
          ],
          alphabetize: { order: 'asc' },
          'newlines-between': 'never',
          pathGroups: [
            {
              pattern: '{@angular,angular/**}',
              group: 'external',
              position: 'before'
            },
            {
              pattern: '{src}/**',
              group: 'parent',
              position: 'before'
            }
          ]
        }
      ],
      'import/newline-after-import': 'error',
      'import/no-named-default': 'error',
      'import/no-named-as-default-member': 'off',
      'import/no-anonymous-default-export': 'error',
      'import/no-useless-path-segments': 'error',
      'import/dynamic-import-chunkname': 'error',
      'sort-imports': [
        'error',
        {
          ignoreDeclarationSort: true,
          ignoreMemberSort: false
        }
      ]
    }
  },
  {
    files: ['*.html'],
    plugins: {
      '@angular-eslint/template': angularEslintTemplatePlugin
    },
    rules: {
      ...angularEslintTemplatePlugin.configs.recommended.rules
    }
  }
];
