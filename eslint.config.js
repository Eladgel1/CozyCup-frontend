import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

const backendStyle = {
  files: ['**/*.js', '**/*.mjs'],
  ignores: ['node_modules', 'coverage', 'dist', 'build', '.tmp', '.vscode'],
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    globals: {
      ...globals.node,
      ...globals.jest,
    },
  },
  rules: {
    // Critical rules
    semi: ['error', 'always'],
    indent: ['error', 2, { SwitchCase: 1 }],

    // Soft naming conventions
    camelcase: ['warn', { properties: 'always' }],
    'id-match': [
      'warn',
      '^(?:[a-z][a-zA-Z0-9]*|[A-Z][a-zA-Z0-9]*|[A-Z0-9_]+)$',
      { onlyDeclarations: true },
    ],
    'new-cap': ['warn', { newIsCap: true, capIsNew: false }],
  },
};

const feReactLayer = {
  files: ['**/*.{js,mjs,jsx}'],
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
    globals: {
      ...globals.browser,
    },
  },
  plugins: {
    react,
    'react-hooks': reactHooks,
  },
  rules: {
    ...react.configs.recommended.rules,
    ...reactHooks.configs.recommended.rules,

    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',

    'react-hooks/rules-of-hooks': 'off',
    'react-hooks/exhaustive-deps': 'off',
  },
  settings: { react: { version: 'detect' } },
};

const testLayer = {
  files: ['tests/**/*.{js,jsx,mjs}'],
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    globals: {
      ...globals.node,
      ...globals.browser,
      ...globals.jest, // describe / it / expect / beforeEach / afterEach / beforeAll / afterAll
      vi: 'readonly',
      global: 'readonly',
    },
  },
  rules: {
  },
};

export default [
  backendStyle,
  js.configs.recommended,
  feReactLayer,
  testLayer,
];
