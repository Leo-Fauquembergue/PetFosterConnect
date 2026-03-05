/// <reference types="vitest" />
import path from "node:path";
import react from "@vitejs/plugin-react";
// On importe defineConfig depuis vitest/config pour inclure le typage de 'test'
import { defineConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@projet/shared-types": path.resolve(__dirname, "../../packages/shared-types/src/index.ts"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    css: true,
  },
});
