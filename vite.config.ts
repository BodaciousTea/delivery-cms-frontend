import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";

export default defineConfig(({ mode }) => {
  return {
    // Use root path in dev, subpath in production
    base: mode === "production" ? "/delivery-cms-frontend/" : "/",

    plugins: [
      react(),
      NodeGlobalsPolyfillPlugin({
        buffer: true,
        process: true,
      }),
    ],
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: "globalThis",
        },
        plugins: [
          NodeGlobalsPolyfillPlugin({
            buffer: true,
            process: true,
          }),
        ],
      },
    },
  };
});
