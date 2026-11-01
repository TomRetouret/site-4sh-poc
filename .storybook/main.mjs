// Configuration du Storybook 4SH (design system et composants du site Eleventy).
// Documentation : docs/storybook.md
import storybook4sh from "./4sh/plugin-vite.mjs";

const enConstruction = process.argv.includes("build");

/** @type { import('@storybook/html-vite').StorybookConfig } */
const config = {
  framework: { name: "@storybook/html-vite", options: {} },
  stories: ["../stories/**/*.mdx", "../stories/**/*.stories.js"],
  addons: ["@storybook/addon-docs"],
  core: { disableTelemetry: true, disableWhatsNewNotifications: true },
  // En développement, Storybook sert les fichiers du site aux mêmes adresses que lui.
  // Une fois publié sous /storybook/, ce sont ceux du site (dist/assets, dist/uploads) :
  // rien n'est copié une seconde fois.
  staticDirs: enConstruction
    ? []
    : [
        { from: "../src/assets", to: "/assets" },
        { from: "../src/uploads", to: "/uploads" }
      ],
  async viteFinal(viteConfig) {
    viteConfig.plugins = [...(viteConfig.plugins || []), storybook4sh()];
    viteConfig.optimizeDeps = viteConfig.optimizeDeps || {};
    viteConfig.optimizeDeps.include = [
      ...(viteConfig.optimizeDeps.include || []),
      "nunjucks/browser/nunjucks-slim.js",
      "markdown-it",
      "@sindresorhus/slugify"
    ];
    // Les gabarits précompilés et les données du site forment un seul gros module : normal.
    viteConfig.build = { ...(viteConfig.build || {}), chunkSizeWarningLimit: 1500 };
    return viteConfig;
  }
};

export default config;
