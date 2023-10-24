import typescript from 'rollup-plugin-typescript2';
import dts from 'rollup-plugin-dts';

const config = [
  {
    input: 'src/index.tsx',
    output: {
      file: 'build/esm/index.jsx',
      format: 'es',
    },
    plugins: [typescript()],
  },
  {
    input: 'src/index.tsx',
    output: {
      file: 'build/cjs/index.jsx',
      format: 'cjs',
    },
    plugins: [typescript()],
  },
  {
    input: 'src/index.tsx',
    output: {
      file: 'build/types/index.d.tsx',
      format: 'es',
    },
    plugins: [dts()],
  },
];

export default config;
