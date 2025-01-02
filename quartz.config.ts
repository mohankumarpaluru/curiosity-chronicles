import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4.0 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "📚 Curiosity Chronicles",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "google",
      tagId: "G-ZXNWEHFMD2"
    },
    locale: "en-US",
    baseUrl: "notes.trixtertempdrive.eu.org",
    ignorePatterns: ["private", "templates", ".obsidian", "**/private", "Private", "**/Private"],
    defaultDateType: "created",
    generateSocialImages: false,
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Montserrat",  // Orbitron
        body: "Inter",
        code: "JetBrains Mono",
      },
      colors: {
        lightMode: {
          light: "#fcfcfd",          // Background color
          lightgray: "#eff2f9",      // Surface color
          gray: "#a6adc1",           // Mid-tone gray for borders and dividers
          darkgray: "#6e738a",       // Dark gray for text
          dark: "#565c71",           // Near-black for highlights and important elements
          secondary:"#5d6cd0",      // Slightly darker lavender for links and secondary actions
          tertiary: "#61bf93",       // Muted teal for tertiary elements
          highlight: "#eff2f9",// Lighter shade of secondary with transparency
          textHighlight: "#FFD70088",
        },
        darkMode: {
          light: "#1d1f30",          // Background color
          lightgray: "#333546",      // Surface color
          gray: "#3f4254",           // Mid-tone gray for borders and dividers
          darkgray: "#b0b2c3",       // Light gray for text
          dark: "#e8eaf4",           // Near-white for highlights and important elements
          secondary: "#4db8b6",      // Teal for links and secondary actions
          tertiary: "#f3d250",       // Muted yellow for tertiary elements
          highlight: "rgba(77, 184, 182, 0.15)", // Teal highlight with opacity
          textHighlight: "#FF66CC88",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "absolute", lazyLoad: true }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.NotFoundPage(),
    ],
  },
}

export default config
