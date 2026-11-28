import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base:
    mode === 'production'
      ? '/design-system-starter-kit/theme-configurator/'
      : '/',
  build: {
    outDir: 'dist',
    // One page with React, the components and the color engine: about 570 kB
    // before gzip, 130 kB after. Start's token CSS per mode and density is
    // split off and loaded when chosen (src/preview/previewStyles.ts).
    chunkSizeWarningLimit: 700,
  },
}));
