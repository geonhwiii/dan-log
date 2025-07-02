import type { CollectionEntry } from 'astro:content';
import { formatDate } from '@lib/utils';
import { BorderBeam } from './BorderBeam';

type Props = {
	entry: CollectionEntry<'blog'>;
	pill?: boolean;
	borderBeam?: boolean;
	delay?: number;
};

const ArrowCard: React.FC<Props> = ({ entry, pill, borderBeam, delay }) => {
	return (
		<a
			className="group relative flex items-center gap-3 rounded-lg border border-black/15 p-4 transition-colors duration-300 ease-in-out hover:bg-black/5 dark:border-white/20 hover:dark:bg-white/10"
			href={`/${entry.collection}/${entry.slug}`}
		>
			<div className="blend w-full group-hover:text-black group-hover:dark:text-white">
				<div className="flex flex-wrap items-center gap-2">
					{pill && (
						<div className="rounded-full border border-black/15 px-2 py-0.5 text-sm capitalize dark:border-white/25">
							post
						</div>
					)}
					<div className="font-departure text-sm uppercase">{formatDate(entry.data.date)}</div>
				</div>
				<div className="mt-3 font-semibold text-black dark:text-white">{entry.data.title}</div>
				<div className="line-clamp-2 text-sm">{entry.data.summary}</div>
				<ul className="mt-2 flex flex-wrap gap-1">
					{entry.data.tags.map((tag: string) => (
						<li
							className="rounded bg-black/5 px-1 py-0.5 font-departure text-black/75 text-xs uppercase dark:bg-white/20 dark:text-white/75"
							key={tag}
						>
							{tag}
						</li>
					))}
				</ul>
			</div>
			<svg
				className="stroke-current group-hover:stroke-black group-hover:dark:stroke-white"
				fill="none"
				height="20"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2.5"
				viewBox="0 0 24 24"
				width="20"
				xmlns="http://www.w3.org/2000/svg"
			>
				<line
					className="translate-x-4 scale-x-0 transition-all duration-300 ease-in-out group-hover:translate-x-1 group-hover:scale-x-100"
					x1="5"
					x2="19"
					y1="12"
					y2="12"
				/>
				<polyline
					className="translate-x-0 transition-all duration-300 ease-in-out group-hover:translate-x-1"
					points="12 5 19 12 12 19"
				/>
			</svg>
			{borderBeam && <BorderBeam delay={delay} />}
		</a>
	);
};

export default ArrowCard;
