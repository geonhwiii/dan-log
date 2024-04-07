import solid, {} from "vite-plugin-solid";
async function getViteConfiguration(isDev, { include, exclude } = {}) {
  const nestedDeps = ["solid-js", "solid-js/web", "solid-js/store", "solid-js/html", "solid-js/h"];
  return {
    resolve: {
      conditions: ["solid", ...isDev ? ["development"] : []],
      dedupe: nestedDeps,
      alias: [{ find: /^solid-refresh$/, replacement: "/@solid-refresh" }]
    },
    optimizeDeps: {
      include: [...nestedDeps],
      exclude: ["@astrojs/solid-js/server.js"]
    },
    plugins: [
      solid({ include, exclude, dev: isDev, ssr: true }),
      {
        name: "@astrojs/solid:config-overrides",
        enforce: "post",
        config() {
          return {
            esbuild: {
              // To support using alongside other JSX frameworks, still let
              // esbuild compile stuff. Solid goes first anyways.
              include: /\.(m?ts|[jt]sx)$/
            }
          };
        }
      }
    ],
    ssr: {
      external: ["babel-preset-solid"]
    }
  };
}
function getRenderer() {
  return {
    name: "@astrojs/solid-js",
    clientEntrypoint: "@astrojs/solid-js/client.js",
    serverEntrypoint: "@astrojs/solid-js/server.js"
  };
}
function src_default(opts = {}) {
  return {
    name: "@astrojs/solid-js",
    hooks: {
      "astro:config:setup": async ({ command, addRenderer, updateConfig }) => {
        addRenderer(getRenderer());
        updateConfig({
          vite: await getViteConfiguration(command === "dev", opts)
        });
      }
    }
  };
}
export {
  src_default as default
};
