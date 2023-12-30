/// Rollup config
import { defineConfig } from 'rollup';
import pluginTerser from '@rollup/plugin-terser';

// Export config
export default defineConfig({
  input: 'src/app.js',
  output: {
    file: 'app.min.cjs',
    format: 'cjs'
  },
  plugins: [pluginTerser()]
});
