import typescript from 'rollup-plugin-typescript2';
import cjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import dts from 'rollup-plugin-dts';

const config = [
  {
    input: 'src/index.tsx',
    output: {
      file: 'build/esm/index.js',
      format: 'es',
    },
    plugins: [typescript(), resolve(), cjs()],
    external: ['react'],
  },
  {
    input: 'src/index.tsx',
    output: {
      file: 'build/cjs/index.js',
      format: 'cjs',
    },
    plugins: [typescript(), resolve(), cjs()],
    external: ['react'],
  },
  {
    input: 'src/index.tsx',
    output: {
      file: 'build/types/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
];

export default config;
