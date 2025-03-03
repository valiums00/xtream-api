import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { copyFileSync } from 'node:fs';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/main.ts'),
        standardized: resolve(__dirname, 'src/serializers/standardized.ts'),
        jsonapi: resolve(__dirname, 'src/serializers/jsonapi.ts'),
        camelcase: resolve(__dirname, 'src/serializers/camelcase.ts'),
      },
      name: 'xtream-api',
    },
    rollupOptions: {
      external: ['camelcase-keys'],
    },
  },
  plugins: [
    dts({
      afterBuild: () => {
        // To ensure the package is supported by all consumers, we must
        // export types that are read as ESM. To do this, there must be
        // duplicate types with the correct extension supplied in the
        // package.json exports field.
        copyFileSync('dist/types/index.d.ts', 'dist/types/index.d.cts');
        copyFileSync('dist/types/jsonapi.d.ts', 'dist/types/jsonapi.d.cts');
        copyFileSync('dist/types/camelcase.d.ts', 'dist/types/camelcase.d.cts');
        copyFileSync('dist/types/standardized.d.ts', 'dist/types/standardized.d.cts');
      },
      rollupTypes: true,
      outDir: 'dist/types',
    }),
  ],
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/types.ts', 'src/vite-env.d.ts'],
    },
  },
});
