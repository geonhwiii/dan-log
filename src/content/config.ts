import { defineCollection, z } from 'astro:content';

const work = defineCollection({
	type: 'content',
	schema: z.object({
		company: z.string(),
		role: z.string(),
		dateStart: z.coerce.date(),
		dateEnd: z.union([z.coerce.date(), z.string()]),
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
		status: z.enum(['완료', '개발중', '계획중']),
	}),
});

export const collections = { work, blog, store };
