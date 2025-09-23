import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 3000,
    open: true,
    fs: {
      allow: ['.']
    }
  },
  build: {
    target: "esnext",
  },
  optimizeDeps: {
    exclude: ['@swc/wasm-web']
  }
});
