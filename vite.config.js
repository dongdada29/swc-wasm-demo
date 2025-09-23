import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
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
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
