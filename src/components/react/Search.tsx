import type { CollectionEntry } from 'astro:content';
import ArrowCard from '@components/react/ArrowCard';
import Fuse from 'fuse.js';
import { useEffect, useState } from 'react';

type Props = {
	data: CollectionEntry<'blog'>[];
};

const Search: React.FC<Props> = ({ data }) => {
	const [query, setQuery] = useState('');
	const [results, setResults] = useState<CollectionEntry<'blog'>[]>([]);

	const fuse = new Fuse(data, {
		keys: ['slug', 'data.title', 'data.summary', 'data.tags'],
		includeMatches: true,
		minMatchCharLength: 2,
		threshold: 0.4,
	});

	useEffect(() => {
		if (query.length < 2) {
			setResults([]);
		} else {
			const fuseResults = fuse.search(query).map((result) => result.item);
			setResults(fuseResults);
		}
	}, [query, data]);

	const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		setQuery(e.target.value);
	};

	return (
		<div className="flex flex-col">
			<div className="relative">
				<input
					autoComplete="off"
					className="w-full rounded border border-black/10 bg-black/5 px-2.5 py-1.5 pl-10 text-black outline-none focus:border-black dark:border-white/20 dark:bg-white/15 dark:text-white focus:dark:border-white"
					name="search"
					onChange={onInput}
					placeholder="글 제목을 검색해 주세요"
					spellCheck={false}
					type="text"
					value={query}
				/>
				<svg className="-translate-y-1/2 absolute top-1/2 left-1.5 size-6 stroke-current">
					<use href={'/ui.svg#search'} />
				</svg>
			</div>
			{query.length >= 2 && results.length >= 1 && (
				<div className="mt-12">
					<div className="mb-2 text-sm uppercase">
						Found {results.length} results for {`'${query}'`}
					</div>
					<ul className="flex flex-col gap-3">
						{results.map((result) => (
							<li key={result.slug}>
								<ArrowCard entry={result} pill={true} />
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
};

export default Search;
