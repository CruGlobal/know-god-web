import angularEslintPlugin from '@angular-eslint/eslint-plugin';
import angularEslintTemplatePlugin from '@angular-eslint/eslint-plugin-template';
import * as path from 'path';

export default [
  {
    ignores: [
      '.github',
      '.angular',
      '*package.json',
      'yarn.lock',
      'dist',
      'e2e/**',
      'karma.conf.js',
      'commitlint.config.js*',
    ],
  },
  {
    files: ['*.ts'],
    languageOptions: {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: [path.resolve('tsconfig.json'), path.resolve('e2e/tsconfig.json')],
        createDefaultProgram: true,
      },
    },
    plugins: {
      '@angular-eslint': angularEslintPlugin,
    },
    rules: {
      ...angularEslintPlugin.configs.recommended.rules,
      '@angular-eslint/component-selector': [
        'error',
        {
          prefix: 'app',
          style: 'kebab-case',
          type: 'element',
        },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        {
          prefix: 'app',
          style: 'camelCase',
          type: 'attribute',
        },
      ],
    },
  },
  {
    files: ['*.html'],
    plugins: {
      '@angular-eslint/template': angularEslintTemplatePlugin,
    },
    rules: {
      ...angularEslintTemplatePlugin.configs.recommended.rules,
    },
  },
];
