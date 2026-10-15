import { defineConfig, loadEnv } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { svelteTesting } from "@testing-library/svelte/vite";
import tailwindcss from "@tailwindcss/vite";
import process from "process";

// Memuat CSS hasil build tanpa memblokir render pertama (mengatasi audit
// "Render blocking requests"). CSS tetap dipasang segera setelah selesai diunduh.
function nonBlockingCss() {
  return {
    name: "non-blocking-css",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        let out = html.replace(
          /<link rel="stylesheet"([^>]*?)href="([^"]+\.css)"([^>]*)>/g,
          (_m, before, href, after) =>
            `<link rel="stylesheet"${before}href="${href}"${after} media="print" onload="this.media='all'">` +
            `<noscript><link rel="stylesheet" href="${href}"></noscript>`
        );

        // Preload font latin (yang dipakai teks Indonesia) agar tidak telat diunduh
        const font = Object.keys(ctx.bundle || {}).find((f) =>
          /plus-jakarta-sans-latin-wght-normal.*\.woff2$/.test(f)
        );
        if (font) {
          out = out.replace(
            "</head>",
            `  <link rel="preload" as="font" type="font/woff2" href="/${font}" crossorigin />\n</head>`
          );
        }
        return out;
      },
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      svelte({
        prebundleSvelteLibraries: false,
      }),
      tailwindcss(),
      svelteTesting(),
      nonBlockingCss(),
    ],
    server: {
      port: Number(env.APP_PORT) || 3004,
    },
    preview: {
      port: Number(env.APP_PORT) || 3004,
    },
    build: {
      sourcemap: true,
      chunkSizeWarningLimit: 1500,
    },
    define: {
      DELCOM_BASEURL: JSON.stringify(
        env.VITE_DELCOM_BASEURL || "http://localhost:8000/api/v1"
      ),
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/setupTests.js",
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html", "lcov"],
        include: ["src/**/*.{js,svelte}"],
        exclude: [
          "src/main.js",
          "src/setupTests.js",
          "src/test-utils.js",
          "**/*.test.{js,jsx}",
          "node_modules/**",
          ".docs/**",
        ],
        thresholds: {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100,
        },
      },
    },
  };
});
