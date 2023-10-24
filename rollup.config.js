import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import cjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';

const config = [
  {
    input: 'src/index.tsx',
    output: {
      file: 'build/esm/index.jsx',
      format: 'es',
    },
    plugins: [typescript(), resolve(), cjs()],
  },
  {
    input: 'src/index.tsx',
    output: {
      file: 'build/cjs/index.jsx',
      format: 'cjs',
    },
    plugins: [typescript(), resolve(), cjs()],
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
