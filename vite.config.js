import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Build config for the extension popup.
// Output goes to dist/ and manifest.json points default_popup at dist/popup.html.
// base:'./' keeps every asset URL relative so it resolves under chrome-extension://.
export default defineConfig({
  plugins: [react()],
  root: resolve(__dirname, 'src/popup'),
  // root is src/popup, but .env lives at the project root — without this,
  // Vite looks for .env inside src/popup and silently never finds it.
  envDir: __dirname,
  base: './',
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'src/popup/popup.html'),
    },
  },
});
