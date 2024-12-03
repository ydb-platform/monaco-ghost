import type { StorybookConfig } from "@storybook/react-webpack5";
import type { RuleSetRule } from "webpack";
import path from "path";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-onboarding",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/react-webpack5",
    options: {
      builder: {
        useSWC: true,
      },
    },
  },
  docs: {
    autodocs: "tag",
  },
  webpackFinal: async (config) => {
    // Add CSS loader if not already present
    if (config.module?.rules) {
      const cssRule = {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
        include: [
          path.resolve(__dirname, "../src"),
          path.resolve(__dirname, "../node_modules/monaco-editor"),
        ],
      };

      // Remove any existing CSS rules
      config.module.rules = config.module.rules.filter(
        (rule): rule is RuleSetRule => {
          if (
            rule &&
            typeof rule === "object" &&
            "test" in rule &&
            rule.test instanceof RegExp
          ) {
            return !rule.test.test(".css");
          }
          return true;
        }
      );

      // Add our custom CSS rule
      config.module.rules.push(cssRule);
    }

    // Add Monaco Editor webpack plugin
    if (config.resolve?.alias) {
      config.resolve.alias["monaco-editor"] = path.resolve(
        __dirname,
        "../node_modules/monaco-editor"
      );
    }

    return config;
  },
};

export default config;
