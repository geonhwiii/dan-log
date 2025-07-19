import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';
import { defineConfig } from 'astro/config';
import rehypeMermaid from 'rehype-mermaid';

// https://astro.build/config
export default defineConfig({
	output: 'static',
	site: 'https://danlog.vercel.app',
	adapter: vercel({
		webAnalytics: { enabled: true },
	}),
	integrations: [
		mdx(),
		sitemap(),
		react({
			include: ['**/react/*'],
		}),
		tailwind({ applyBaseStyles: false }),
	],
	markdown: {
		rehypePlugins: [rehypeMermaid],
		syntaxHighlight: {
			type: 'shiki',
			excludeLangs: ['mermaid', 'math'],
		},
		shikiConfig: {
			themes: {
				light: 'github-light',
				dark: 'aurora-x',
			},
		},
	},
});
