import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

// Library mode: emit ESM + type declarations + one compiled stylesheet.
// React is a peer dependency, so it stays external. `tokens.css` is copied to
// dist by the build script (see package.json) so it is importable standalone.
export default defineConfig({
  plugins: [
    react(),
    dts({ include: ['src'], rollupTypes: true, tsconfigPath: './tsconfig.json' }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: () => 'index.js',
    },
    cssCodeSplit: false,
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: { assetFileNames: 'style.css' },
    },
    sourcemap: true,
  },
  css: {
    modules: {
      generateScopedName: 'cdu_[name]__[local]',
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    css: true,
    setupFiles: [],
    include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/components/**/*.tsx'],
      reporter: ['text', 'lcov'],
      // Components 80% per TESTING-STANDARDS. TraceViewer + JobStateMachineDiagram
      // Widen the covered set as components land; tokens are verified by contrast.test.ts.
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
