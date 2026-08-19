import { defineConfig } from "vite"
import solidPlugin from "@solidjs/vite-plugin"

export default defineConfig({
  plugins: [solidPlugin()],
  build: {
    minify: "oxc",
    lib: {
      entry: "src/main.jsx",
      name: "App",
      formats: ["iife"],
      fileName: () => "main.js",
    },
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
})
