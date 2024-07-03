import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import Icons from "unplugin-icons/vite";
import checklist from "./src/lib/datasource/vite-plugin-checklist";
import browserslistToEsbuild from "browserslist-to-esbuild";

export default defineConfig({
  plugins: [
    sveltekit(),
    Icons({
      compiler: "svelte",
    }),
    checklist(),
  ],
  build: {
    target: browserslistToEsbuild("last 2 versions or >= 0.25%, not dead"),
    commonjsOptions: { transformMixedEsModules: true },
  },
});
