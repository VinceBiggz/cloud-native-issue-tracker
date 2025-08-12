/**
 * @author Vincent Wachira
 * @version v1.0.0
 * @date 12-Aug-2025
 * @description ESLint Configuration - Code Quality and Standards
 * 
 * This configuration enforces code quality standards across the project.
 * It includes TypeScript support, Prettier integration, and common best practices.
 */

module.exports = {
  root: true,
  env: {
    node: true,
    es2020: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: ['./tsconfig.json', './infra/tsconfig.json', './services/*/tsconfig.json', './packages/*/tsconfig.json'],
  },
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    // Prettier integration
    'prettier/prettier': 'error',
    
    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/prefer-const': 'error',
    
    // General code quality
    'no-console': 'off', // Allow console.log for Lambda functions
    'no-debugger': 'error',
    'no-duplicate-imports': 'error',
    'no-unused-expressions': 'error',
    'prefer-const': 'error',
    
    // Documentation
    'require-jsdoc': 'off', // We use JSDoc comments manually
    'valid-jsdoc': 'off',
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    'cdk.out/',
    '*.js', // Ignore root JS files like test-local.js
  ],
  overrides: [
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
};
