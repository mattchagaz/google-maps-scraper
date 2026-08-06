import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Design-preview-only build: swaps the real @supabase/supabase-js for a
// local mock with seed data, so the dashboard can be screenshotted without
// a real backend. Never used for the actual deployable app.
export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@supabase/supabase-js': resolve(__dirname, 'src/mocks/supabase-mock.js'),
    },
  },
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://preview.local'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('preview-key'),
  },
  build: {
    outDir: 'dist-preview',
    emptyOutDir: true,
  },
});
