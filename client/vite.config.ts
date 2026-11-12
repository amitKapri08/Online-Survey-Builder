import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { loadEnv, type Plugin } from "vite";

function cspPlugin(env: Record<string, string>): Plugin {
  let connectSource = "connect-src 'self'";
  const apiUrl = env.VITE_API_URL;

  if (apiUrl && /^https?:\/\//.test(apiUrl)) {
    connectSource = `connect-src 'self' ${new URL(apiUrl).origin}`;
  }

  return {
    name: "inject-csp",
    apply: "build",
    transformIndexHtml() {
      return [
        {
          tag: "meta",
          attrs: {
            "http-equiv": "Content-Security-Policy",
            content: [
              "default-src 'self'",
              "script-src 'self'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data:",
              "font-src 'self'",
              connectSource,
            ].join("; "),
          },
          injectTo: "head-prepend",
        },
      ];
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, fileURLToPath(new URL("./", import.meta.url)), "");

  return {
    plugins: [react(), tailwindcss(), cspPlugin(env)],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (
                id.includes("react") ||
                id.includes("react-dom") ||
                id.includes("react-router")
              ) {
                return "react";
              }
              if (id.includes("@tanstack")) {
                return "query";
              }
              if (
                id.includes("react-hook-form") ||
                id.includes("zod") ||
                id.includes("@hookform")
              ) {
                return "forms";
              }
              if (id.includes("@base-ui") || id.includes("lucide")) {
                return "ui";
              }
              return "vendor";
            }
          },
        },
      },
    },
  };
});
