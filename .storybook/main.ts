import type { StorybookConfig } from "@storybook/sveltekit";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|ts|svelte)"],
  addons: [
    "@storybook/addon-svelte-csf",
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest",
  ],
  framework: {
    name: "@storybook/sveltekit",
    options: {},
  },
  async viteFinal(config) {
    // Define environment variables for Storybook
    config.define = {
      ...config.define,
      "import.meta.env.MODE": JSON.stringify("development"),
      "import.meta.env.DEV": "true",
      "import.meta.env.PROD": "false",
      "import.meta.env.SSR": "false",
    };

    // Add resolve alias for mocking DI container
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "$lib/shared/inversify": new URL(
        "./mock-inversify.ts",
        import.meta.url
      ).pathname.replace(/^\/([A-Z]:)/, "$1"),
    };

    return config;
  },
};
export default config;
