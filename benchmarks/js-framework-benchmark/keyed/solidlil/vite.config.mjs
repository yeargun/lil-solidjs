import { defineConfig } from "vite"

export default defineConfig({
  build: {
    minify: "oxc",
    lib: {
      entry: "src/main.js",
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
