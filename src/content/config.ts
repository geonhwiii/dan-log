import { defineCollection, z } from 'astro:content';

const profile = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		description: z.string().optional(),
		order: z.number().optional(),
	}),
});

const blog = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		summary: z.string(),
		date: z.coerce.date(),
		tags: z.array(z.string()),
		draft: z.boolean().optional(),
		image: z.string().optional(),
	}),
});

const store = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		description: z.string(),
		image: z.string().optional(),
		link: z.string().optional(),
		github: z.string().optional(),
		tech: z.array(z.string()),
		date: z.coerce.date(),
	}),
});

export const collections = { profile, blog, store };
