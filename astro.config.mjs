import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';

import react from '@astrojs/react';

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
		shikiConfig: {
			themes: {
				light: 'github-light',
				dark: 'aurora-x',
			},
		},
	},
});
