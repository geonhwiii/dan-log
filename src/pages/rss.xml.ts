import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE } from '@consts';

type Context = {
	site: string;
};

export async function GET(context: Context) {
	const posts = await getCollection('blog');

	const items = [...posts];

	items.sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());

	return rss({
		title: SITE.TITLE,
		description: SITE.DESCRIPTION,
		site: context.site,
		items: items.map((item) => ({
			title: item.data.title,
			description: item.data.summary,
			pubDate: item.data.date,
			link: `/blog/${item.slug}/`,
		})),
	});
}
