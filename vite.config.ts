import { defineConfig } from 'vite';

export default defineConfig({
  // IMPORTANT: replace __REPO_NAME__ with your GitHub repo name
  base: '/__REPO_NAME__/',
  server: {
    port: 5173,
  },
});
