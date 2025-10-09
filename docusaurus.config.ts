// import {themes as prismThemes} from 'prism-react-renderer';
// import type {Config} from '@docusaurus/types';
// import type * as Preset from '@docusaurus/preset-classic';

// const config: Config = {
//   title: 'Ryukato\'s Blog',
//   tagline: 'whatever',
//   favicon: 'img/favicon.ico',

//   // Set the production url of your site here
//   url: 'https://ryukato.gihub.io',
//   // Set the /<baseUrl>/ pathname under which your site is served
//   // For GitHub pages deployment, it is often '/<projectName>/'
//   baseUrl: '',

//   // GitHub pages deployment config.
//   // If you aren't using GitHub pages, you don't need these.
//   organizationName: 'ryukato', // Usually your GitHub org/user name.
//   projectName: 'sample-ryukato.github.io', // Usually your repo name.
//   deploymentBranch: 'master',

//   onBrokenLinks: 'warn',
//   onBrokenMarkdownLinks: 'warn',

//   // Even if you don't use internationalization, you can use this field to set
//   // useful metadata like html lang. For example, if your site is Chinese, you
//   // may want to replace "en" with "zh-Hans".
// //  i18n: {
// //    defaultLocale: 'en',
// //    locales: ['en'],
// //  },

//   presets: [
//     [
//       'classic',
//       {
//         docs: {
//           sidebarPath: './sidebars.ts',
//         },
//         blog: {
//           showReadingTime: true,
//           postsPerPage: 20,
//            blogSidebarTitle: 'All posts',
//           blogSidebarCount: 'ALL',
//         },
//         theme: {
//           customCss: './src/css/custom.css',
//         },
//       } satisfies Preset.Options,
//     ],
//   ],

//   themeConfig: {
//     // Replace with your project's social card
//     image: 'img/docusaurus-social-card.jpg',
//     navbar: {
//       title: 'Ryukato\'s Blog',
//       logo: {
//         alt: 'My Site Logo',
//         src: 'img/logo.svg',
//       },
//       items: [
//        {to: '/aboutme', label: 'AboutMe', position: 'left'},
//        {to: '/blog', label: 'Blog', position: 'left'},
//       ],
//     },
//     footer: {
//     },
//     prism: {
//       theme: prismThemes.github,
//       darkTheme: prismThemes.dracula,
//     },
//   } satisfies Preset.ThemeConfig,
//   scripts: [
//     {
//         src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8959895348783705',
//         async: true,
//         crossorigin: "anonymous"
//     }
//   ],
// };

// export default config;

import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Ryukato\'s Blog',
  tagline: 'LLM, Backend Architecture, and Prompt Engineering',
  favicon: 'img/favicon.ico',

  // ✅ Fixed URL Typo (github.io)
  url: 'https://ryukato.github.io',
  baseUrl: '',

  // ✅ GitHub pages deployment config
  organizationName: 'ryukato',
  projectName: 'blog',
  deploymentBranch: 'master',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // ✅ Metadata for SEO and Accessibility
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ko'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
        },
        blog: {
          showReadingTime: true,
          postsPerPage: 20,
          blogSidebarTitle: 'All posts',
          blogSidebarCount: 'ALL',
          // ✅ SEO: Default metadata per blog post
          blogTitle: "Ryukato's Technical Blog",
          blogDescription:
            'A technical blog on LLMs, backend systems, and prompt engineering written by Yoonyoul Yoo (Ryukato)',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
          filename: 'sitemap.xml',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // ✅ Global OpenGraph & Twitter Card Image
    image: 'img/og-image.jpg',

    metadata: [
      {name: 'keywords', content: 'Ryukato, blog, docusaurus, LLM, backend, prompt engineering, AI, architecture, drug search'},
      {name: 'author', content: 'Yoonyoul Yoo'},
      {name: 'description', content: 'Technical writings by Yoonyoul Yoo on LLMs, backend systems, and developer identity.'},
      {name: 'twitter:card', content: 'summary_large_image'},
      {name: 'twitter:title', content: "Ryukato's Blog"},
      {name: 'twitter:description', content: 'A Docusaurus-powered blog on AI, LLM, and backend engineering.'},
      {name: 'twitter:image', content: 'https://ryukato.github.io/blog/img/og-image.jpg'},
      {property: 'og:type', content: 'website'},
      {property: 'og:title', content: "Ryukato's Blog"},
      {property: 'og:description', content: 'Articles about LLMs, backend design, and prompt architecture.'},
      {property: 'og:image', content: 'https://ryukato.github.io/blog/img/og-image.jpg'},
    ],

    navbar: {
      title: "Ryukato's Blog",
      logo: {
        alt: 'Ryukato Blog Logo',
        src: 'img/logo.svg',
      },
      items: [
        {to: '/aboutme', label: 'About Me', position: 'left'},
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/ryukato',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },

    footer: {
      style: 'dark',
      links: [
        {
          title: 'Content',
          items: [
            {label: 'Blog', to: '/blog'},
            {label: 'About', to: '/aboutme'},
          ],
        },
        {
          title: 'Follow',
          items: [
            {label: 'GitHub', href: 'https://github.com/ryukato'},
            {label: 'LinkedIn', href: 'https://www.linkedin.com/in/yoonyoulyoo/'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Yoonyoul Yoo (Ryukato). Built with Docusaurus.`,
    },

    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,

  // ✅ Google AdSense or Analytics Script
  scripts: [
    {
      src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8959895348783705',
      async: true,
      crossorigin: 'anonymous',
    },
  ],
};

export default config;