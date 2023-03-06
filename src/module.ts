import {
  defineNuxtModule,
  addPlugin,
  createResolver,
  addImportsDir,
  addComponent,
  addImports,
} from "@nuxt/kit";
import { fileURLToPath } from "url";
import type { ThemeConfig } from "./runtime/types";
export type { NavbarRoute, ThemeConfig, TabbarRoute } from "./runtime/types";
import naive from "naive-ui";

// Module options TypeScript inteface definition
export interface ModuleOptions {
  defaultThemeConfig?: ThemeConfig;
  defaultColorMode: "light" | "dark" | "system";
  defaultIconSize: number;
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "@bg-dev/nuxt-naiveui",
    configKey: "naiveui",
  },

  // Default configuration options of the Nuxt module
  defaults: {
    defaultColorMode: "system",
    defaultIconSize: 20,
  },

  // Add types for volar
  hooks: {
    "prepare:types": ({ tsConfig, references }) => {
      tsConfig.compilerOptions!.types.push("naive-ui/volar");
      references.push({
        types: "naive-ui/volar",
      });
    },
  },

  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url);
    const runtimeDir = fileURLToPath(new URL("./runtime", import.meta.url));

    // Add plugins
    addPlugin(resolve(runtimeDir, "naive.server"));

    // Add composables directory
    addImportsDir(resolve(runtimeDir, "composables"));

    // Add components
    addComponent({
      name: "NaiveConfig",
      filePath: resolve(runtimeDir, "components", "NaiveConfig.vue"),
    });
    addComponent({
      name: "NaiveNavbar",
      filePath: resolve(runtimeDir, "components", "NaiveNavbar.vue"),
    });
    addComponent({
      name: "NaiveIcon",
      filePath: resolve(runtimeDir, "components", "NaiveIcon.vue"),
    });
    addComponent({
      name: "NaiveColorModeSwitch",
      filePath: resolve(runtimeDir, "components", "NaiveColorModeSwitch.vue"),
    });
    addComponent({
      name: "NaiveTabbar",
      filePath: resolve(runtimeDir, "components", "NaiveTabbar.vue"),
    });

    // Pass module options to runtimeConfig object
    nuxt.options.runtimeConfig.public.naiveui = options;

    // Add imports for naive-ui components
    const naiveComponents = Object.keys(naive).filter((name) =>
      /^(N[A-Z]|n-[a-z])/.test(name)
    );

    naiveComponents.forEach((name) => {
      addComponent({
        export: name,
        name: name,
        filePath: "naive-ui",
      });
    });

    // Add imports for naive-ui composables
    const naiveComposables = [
      "useDialog",
      "useMessage",
      "useNotification",
      "useLoadingBar",
      "useThemeVars",
      "useDialogReactiveList",
      "useOsTheme",
    ];

    naiveComposables.forEach((name) => {
      addImports({
        name: name,
        as: name,
        from: "naive-ui",
      });
    });

    // Transpile naive modules
    if (process.env.NODE_ENV === "production") {
      nuxt.options.build.transpile.push(
        "naive-ui",
        "vueuc",
        "@css-render/vue3-ssr",
        "@juggle/resize-observer"
      );
    } else {
      nuxt.options.build.transpile.push("@juggle/resize-observer");
    }
  },
});
