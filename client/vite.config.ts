import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { loadEnv, type Plugin } from "vite";

function cspPlugin(env: Record<string, string>): Plugin {
  let connectSource = "connect-src 'self'";
  const apiUrl = env.VITE_API_URL;

  // Only absolute API URLs widen connect-src. A relative value such as /api
  // is served from the same origin, so 'self' already covers it.
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
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              connectSource,
            ].join("; "),
          },
          injectTo: "head-prepend",
        },
      ];
    },
  };
}

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, fileURLToPath(new URL("./", import.meta.url)), "");

  if (command === "build" && !env.VITE_API_URL) {
    throw new Error(
      "VITE_API_URL is required for production builds. " +
        "Set it in the build environment (for example https://your-api.onrender.com/api).",
    );
  }

  if (!env.VITE_API_URL) {
    console.warn(
      "[vite] VITE_API_URL is not set. API requests will target the current origin.",
    );
  }

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
            if (!id.includes("node_modules")) {
              return undefined;
            }

            // Order matters: react-hook-form and @tanstack/react-query both
            // contain the substring "react", so they must be matched first.
            if (
              id.includes("react-hook-form") ||
              id.includes("@hookform") ||
              /[\\/]node_modules[\\/]zod[\\/]/.test(id)
            ) {
              return "forms";
            }
            if (id.includes("@tanstack")) {
              return "query";
            }
            if (id.includes("@base-ui") || id.includes("lucide")) {
              return "ui";
            }
            if (
              /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(
                id,
              )
            ) {
              return "react";
            }
            return "vendor";
          },
        },
      },
    },
  };
});
