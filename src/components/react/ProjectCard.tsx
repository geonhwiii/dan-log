import { formatDate } from '@lib/utils';
import { useEffect, useState } from 'react';
import { useTheme } from '../../utils/useTheme';

interface ProjectData {
	title: string;
	description: string;
	image?: string;
	tech: string[];
	date: string | Date;
	github?: string;
	link?: string;
}

interface ProjectCardProps {
	project: {
		slug: string;
		data: ProjectData;
	};
}

export default function ProejctCard({ project }: ProjectCardProps) {
	const theme = useTheme();
	const isDark = theme === 'dark';
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		// 컴포넌트 마운트 후 로딩 완료 표시
		const timer = setTimeout(() => {
			setIsLoaded(true);
		}, 100);

		return () => clearTimeout(timer);
	}, []);

	return (
		<div
			className={`mx-auto w-full max-w-xs transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
		>
			<div
				className={`card-border relative flex animate-float flex-col overflow-hidden rounded-2xl ${isDark ? '' : 'bg-white/80 shadow-lg backdrop-blur-sm'}`}
			>
				<div className="relative flex justify-center p-4">
					<div
						className={`gradient-border inner-glow relative h-48 w-full overflow-hidden rounded-xl ${isDark ? '' : 'border-gray-200'}`}
					>
						{project.data.image ? (
							<img
								alt={project.data.title}
								className="relative h-full w-full object-cover opacity-50"
								src={project.data.image}
							/>
						) : (
							<div className="absolute inset-0 opacity-10">
								<div
									className="h-full w-full animate-pulse"
									style={{
										backgroundImage: isDark
											? 'linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)'
											: 'linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px)',
										backgroundSize: '15px 15px',
									}}
								/>
							</div>
						)}
					</div>
				</div>
				<div
					className={`h-px w-full bg-gradient-to-r from-transparent ${isDark ? 'via-white/30' : 'via-gray-300'} to-transparent`}
				/>
				<div className="p-4">
					<div className="mb-3 flex flex-wrap gap-1">
						{project.data.tech.slice(0, 3).map((tech, index) => (
							<span
								className={`glass inline-block rounded-full border px-3 py-1 font-medium text-xs ${
									isDark ? 'border-indigo-400/30 text-indigo-300' : 'border-indigo-300 bg-indigo-50/50 text-indigo-600'
								}`}
								key={index}
							>
								{tech}
							</span>
						))}
					</div>
					<h3 className={`mb-2 font-medium text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
						{project.data.title}
					</h3>
					<p className={`mb-4 text-xs leading-relaxed ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
						{project.data.description}
					</p>
					<div className="flex items-center justify-between">
						<a
							className={`glass flex items-center rounded-lg border px-3 py-1.5 font-medium text-xs transition ${
								isDark
									? 'border-indigo-400/30 text-indigo-400 hover:text-indigo-300'
									: 'border-indigo-300 bg-indigo-50/50 text-indigo-600 hover:text-indigo-700'
							}`}
							href={`/store/${project.slug}`}
						>
							{'View Details'}
							<svg className="ml-1 h-3 w-3" fill="none" viewBox="0 0 24 24">
								<path
									d="M5 12H19M19 12L12 5M19 12L12 19"
									stroke="currentColor"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
								/>
							</svg>
						</a>
						<span
							className={`glass rounded-full border px-2 py-1 text-xs ${
								isDark ? 'border-white/10 text-white/50' : 'border-gray-200 bg-gray-50/50 text-gray-500'
							}`}
						>
							{formatDate(typeof project.data.date === 'string' ? new Date(project.data.date) : project.data.date)}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
