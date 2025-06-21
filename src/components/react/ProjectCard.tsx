import { formatDate } from '@lib/utils';
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

	return (
		<div className="w-full mx-auto max-w-xs">
			<div
				className={`relative card-border overflow-hidden rounded-2xl flex flex-col animate-float ${isDark ? '' : 'bg-white/80 backdrop-blur-sm shadow-lg'}`}
			>
				<div className="p-4 flex justify-center relative">
					<div
						className={`w-full h-48 rounded-xl gradient-border inner-glow overflow-hidden relative ${isDark ? '' : 'border-gray-200'}`}
					>
						{project.data.image ? (
							<img
								src={project.data.image}
								alt={project.data.title}
								className="w-full h-full object-cover relative opacity-50"
							/>
						) : (
							<div className="absolute inset-0 opacity-10">
								<div
									className="w-full h-full animate-pulse"
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
					className={`w-full h-px bg-gradient-to-r from-transparent ${isDark ? 'via-white/30' : 'via-gray-300'} to-transparent`}
				/>
				<div className="p-4">
					<div className="flex flex-wrap gap-1 mb-3">
						{project.data.tech.slice(0, 3).map((tech, index) => (
							<span
								key={index}
								className={`inline-block px-3 py-1 glass rounded-full text-xs font-medium border ${
									isDark ? 'text-indigo-300 border-indigo-400/30' : 'text-indigo-600 border-indigo-300 bg-indigo-50/50'
								}`}
							>
								{tech}
							</span>
						))}
					</div>
					<h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
						{project.data.title}
					</h3>
					<p className={`mb-4 leading-relaxed text-xs ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
						{project.data.description}
					</p>
					<div className="flex justify-between items-center">
						<a
							href={`/store/${project.slug}`}
							className={`transition flex items-center text-xs font-medium glass px-3 py-1.5 rounded-lg border ${
								isDark
									? 'text-indigo-400 hover:text-indigo-300 border-indigo-400/30'
									: 'text-indigo-600 hover:text-indigo-700 border-indigo-300 bg-indigo-50/50'
							}`}
						>
							{'View Details'}
							<svg className="w-3 h-3 ml-1" viewBox="0 0 24 24" fill="none">
								<path
									d="M5 12H19M19 12L12 5M19 12L12 19"
									stroke="currentColor"
									strokeWidth={2}
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</a>
						<span
							className={`text-xs glass px-2 py-1 rounded-full border ${
								isDark ? 'text-white/50 border-white/10' : 'text-gray-500 border-gray-200 bg-gray-50/50'
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
