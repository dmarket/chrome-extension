const nx = require('@nx/eslint-plugin');
const eslintPluginJsonc = require('eslint-plugin-jsonc');

module.exports = [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  ...nx.configs['flat/angular'],
  ...eslintPluginJsonc.configs['flat/recommended-with-jsonc'],
  {
    ignores: ['**/dist', './circleci'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.mjs', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$'],
          depConstraints: [
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            {
              sourceTag: 'scope:mythical-games',
              onlyDependOnLibsWithTags: ['scope:mythical-games', 'scope:shared'],
            },
            {
              sourceTag: 'scope:mythos-foundation',
              onlyDependOnLibsWithTags: ['scope:mythos-foundation', 'scope:shared'],
            },
            {
              sourceTag: 'scope:dmarket-chrome-extension',
              onlyDependOnLibsWithTags: ['scope:dmarket-chrome-extension', 'scope:shared'],
            },
            {
              sourceTag: 'type:css-framework',
              onlyDependOnLibsWithTags: ['type:css-framework'],
            },
            {
              sourceTag: 'type:data-access',
              onlyDependOnLibsWithTags: ['type:layout', 'type:utils'],
            },
            {
              sourceTag: 'type:feature',
              onlyDependOnLibsWithTags: [
                'type:ui-base',
                'type:ui-domains',
                'type:ui-directives',
                'type:ui-pipes',
                'type:data-access',
                'type:i18n',
                'type:ui-pipes',
                'type:utils',
                'type:feature-flags',
              ],
            },
            {
              sourceTag: 'type:layout',
              onlyDependOnLibsWithTags: [
                'type:feature',
                'type:ui-pipes',
                'type:ui-base',
                'type:i18n',
                'type:utils',
              ],
            },
            {
              sourceTag: 'type:ui-base',
              onlyDependOnLibsWithTags: [
                'type:ui-base',
                'type:types',
                'type:ui-directives',
                'type:ui-pipes',
                'type:i18n',
                'type:utils',
              ],
            },
            {
              sourceTag: 'type:ui-domains',
              onlyDependOnLibsWithTags: [
                'type:ui-base',
                'type:ui-domains',
                'type:ui-directives',
                'type:ui-pipes',
                'type:types',
                'type:i18n',
                'type:utils',
              ],
            },
            {
              sourceTag: 'type:ui-directives',
              onlyDependOnLibsWithTags: [],
            },
            {
              sourceTag: 'type:ui-pipes',
              onlyDependOnLibsWithTags: ['type:utils', 'type:types'],
            },
            {
              sourceTag: 'type:ui-explorer',
              onlyDependOnLibsWithTags: ['type:css-framework'],
            },
            {
              sourceTag: 'type:types',
              onlyDependOnLibsWithTags: [],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.mjs', '**/*.jsx'],
    rules: {
      'no-console': ['error'],
      'no-template-curly-in-string': 'error',
      eqeqeq: ['error', 'smart'],
      'max-classes-per-file': 'error',
      'no-extra-semi': 'error',
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
      'max-len': [
        'error',
        {
          code: 140,
        },
      ],
      'no-new-wrappers': 'error',
      'no-throw-literal': 'error',
      '@typescript-eslint/consistent-type-definitions': 'error',
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'error',
      'no-invalid-this': 'off',
      '@typescript-eslint/no-invalid-this': ['warn'],
      'no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-expressions': 'error',
      'prefer-arrow-callback': ['error', { allowNamedFunctions: true }],
      'no-magic-numbers': [
        'error',
        { ignoreArrayIndexes: true, ignore: [0, 1, -1], ignoreDefaultValues: true },
      ],
      quotes: ['error', 'single', { allowTemplateLiterals: true, avoidEscape: true }],
      'max-lines': [
        'error',
        {
          max: 300,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variable',
          format: ['camelCase'],
          leadingUnderscore: 'forbid',
          trailingUnderscore: 'forbid',
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        {
          selector: 'enumMember',
          format: ['PascalCase'],
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
];

// const { FlatCompat } = require('@eslint/eslintrc');
// const baseConfig = require('../../eslint.config.js');
// const js = require('@eslint/js');

// const compat = new FlatCompat({
//   baseDirectory: __dirname,
//   recommendedConfig: js.configs.recommended,
// });

// module.exports = [
//   ...baseConfig,
//   ...compat
//     .config({
//       extends: ['plugin:@nx/angular', 'plugin:@angular-eslint/template/process-inline-templates'],
//     })
//     .map((config) => ({
//       ...config,
//       files: ['**/*.ts'],
//       rules: {
//         ...config.rules,
//         '@angular-eslint/directive-selector': [
//           'error',
//           {
//             type: 'attribute',
//             prefix: 'app-mf',
//             style: 'camelCase',
//           },
//         ],
//         '@angular-eslint/component-selector': [
//           'error',
//           {
//             type: 'element',
//             prefix: 'app-mf',
//             style: 'kebab-case',
//           },
//         ],
//       },
//     })),
//   ...compat.config({ extends: ['plugin:@nx/angular-template'] }).map((config) => ({
//     ...config,
//     files: ['**/*.html'],
//     rules: {
//       ...config.rules,
//     },
//   })),
// ];
