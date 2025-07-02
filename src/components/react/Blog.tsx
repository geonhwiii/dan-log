import type { CollectionEntry } from 'astro:content';
import ArrowCard from '@components/react/ArrowCard';
import { cn } from '@lib/utils';
import { useEffect, useState } from 'react';

type Props = {
	tags: string[];
	data: CollectionEntry<'blog'>[];
};

const Blog: React.FC<Props> = ({ data, tags }) => {
	const [filter, setFilter] = useState<Set<string>>(new Set());
	const [posts, setPosts] = useState<CollectionEntry<'blog'>[]>([]);

	useEffect(() => {
		setPosts(
			data.filter((entry) =>
				Array.from(filter).every((value) =>
					entry.data.tags.some((tag: string) => tag.toLowerCase() === value.toLowerCase()),
				),
			),
		);
	}, [data, filter]);

	const toggleTag = (tag: string) => {
		setFilter((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(tag)) {
				newSet.delete(tag);
			} else {
				newSet.add(tag);
			}
			return newSet;
		});
	};

	return (
		<div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
			<div className="col-span-3 sm:col-span-1">
				<div className="sticky top-24">
					<div className="mb-2 font-semibold text-black text-sm uppercase dark:text-white">Filter</div>
					<ul className="flex flex-wrap gap-1.5 sm:flex-col">
						{tags.map((tag) => (
							<li key={tag}>
								<button
									className={cn(
										'w-full rounded px-2 py-1',
										'overflow-hidden overflow-ellipsis whitespace-nowrap',
										'flex items-center gap-2',
										'bg-black/5 dark:bg-white/10',
										'hover:bg-black/10 hover:dark:bg-white/15',
										'transition-colors duration-300 ease-in-out',
										filter.has(tag) && 'text-black dark:text-white',
									)}
									onClick={() => toggleTag(tag)}
								>
									<svg
										className={cn(
											'size-5 fill-black/50 dark:fill-white/50',
											'transition-colors duration-300 ease-in-out',
											filter.has(tag) && 'fill-black dark:fill-white',
										)}
									>
										<use className={cn(filter.has(tag) ? 'hidden' : 'block')} href={'/ui.svg#square'} />
										<use className={cn(filter.has(tag) ? 'block' : 'hidden')} href={'/ui.svg#square-check'} />
									</svg>
									{tag}
								</button>
							</li>
						))}
					</ul>
				</div>
			</div>
			<div className="col-span-3 sm:col-span-2">
				<div className="flex flex-col">
					<div className="mb-2 font-departure text-sm uppercase">
						SHOWING {posts.length} OF {data.length} POSTS
					</div>
					<ul className="flex flex-col gap-3">
						{posts.map((post, index) => (
							<li key={post.slug}>
								<ArrowCard borderBeam={index <= 2} delay={index * 0.5} entry={post} />
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	);
};

export default Blog;
