import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const base = env.VITE_BASE_URL || '/';

  return {
    server: {
      host: "::",
      port: 4173,
    },
    base,
    plugins: [react()],
    define: {
        global: 'globalThis'
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        buffer: 'buffer'
      },
    },
    optimizeDeps: {
      include: ['buffer'],
    },
  };
});
