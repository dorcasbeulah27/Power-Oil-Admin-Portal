import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import EnvironmentPlugin from "vite-plugin-environment";

export default defineConfig({
  plugins: [
    react(),
    EnvironmentPlugin({
      VITE_API_BASE_URL: "https://poweroil-backend.onrender.com",
      VITE_SPINNER_API_URL:
        "https://power-oil-spinner.dorcasbeulah27.workers.dev",
    }),
  ],
  // server: {
  //   port: 3001,
  //   proxy: {
  //     "/api": {
  //       target: "http://localhost:5000",
  //       changeOrigin: true,
  //     },
  //   },
  // },
});
