import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
  { ignores: ['.next/**', 'node_modules/**', 'public/**', 'tsconfig.tsbuildinfo', 'playwright-report/**', 'test-results/**'] },

  js.configs.recommended,

  {
    // Register no-op plugins for Next.js / react-hooks so legacy
    // `eslint-disable-next-line @next/next/...` comments parse without error.
    plugins: {
      '@next/next': { rules: { 'no-img-element': { create: () => ({}) } } },
      'react-hooks': { rules: { 'exhaustive-deps': { create: () => ({}) }, 'rules-of-hooks': { create: () => ({}) } } },
    },
  },

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
      globals: {
        window: 'readonly', document: 'readonly', navigator: 'readonly',
        console: 'readonly', process: 'readonly', fetch: 'readonly',
        setTimeout: 'readonly', clearTimeout: 'readonly',
        setInterval: 'readonly', clearInterval: 'readonly',
        URLSearchParams: 'readonly', URL: 'readonly', FormData: 'readonly',
        Blob: 'readonly', File: 'readonly', FileList: 'readonly',
        HTMLInputElement: 'readonly', HTMLTextAreaElement: 'readonly',
        HTMLDivElement: 'readonly', HTMLSpanElement: 'readonly',
        HTMLCanvasElement: 'readonly', MediaQueryListEvent: 'readonly',
        React: 'readonly', JSX: 'readonly', NodeJS: 'readonly',
        localStorage: 'readonly', sessionStorage: 'readonly',
        ServiceWorkerRegistration: 'readonly', requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
      },
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      'no-unused-vars': 'off',                       // handled by TS rule
      'no-undef': 'off',                             // TS handles this
      'no-empty': ['warn', { allowEmptyCatch: true }],
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  {
    // Node/CommonJS configs use `module.exports`/`require`.
    files: ['**/*.config.{js,cjs}', 'next.config.js', 'tailwind.config.js', 'postcss.config.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { module: 'readonly', require: 'readonly', __dirname: 'readonly', process: 'readonly' },
    },
    rules: { 'no-console': 'off' },
  },

  {
    files: ['**/scripts/**'],
    rules: { 'no-console': 'off' },
  },
];
