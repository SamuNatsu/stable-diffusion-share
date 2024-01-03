/// Rollup config
import { defineConfig } from 'rollup';
import pluginTerser from '@rollup/plugin-terser';

// Export config
export default defineConfig({
  input: 'src/app.js',
  output: {
    file: 'app.min.mjs',
    format: 'esm'
  },
  plugins: [pluginTerser()]
});
