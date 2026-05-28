import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: './lib/index.ts',
  format: ['esm', 'cjs'],
  dts: true,
  target: 'es2020',
  clean: true,
  deps: {
    neverBundle: ['aws-cdk-lib', 'constructs'],
  },
});
