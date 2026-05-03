import { cn } from '@lib/utils';
import { AlertCircleIcon } from 'lucide-react';

type Props = {
	className?: string;
	title: string;
	description: string;
};

export function Alert({ title, description, className }: Props) {
	return (
		<div
			className={cn(
				'border-none rounded-2xl leading-normal p-3 flex flex-col gap-1 dark:bg-white/10 bg-black/5',
				className,
			)}
		>
			<div className="flex items-center gap-2">
				<AlertCircleIcon className="size-4" />
				<span className="text-sm font-bold">{title}</span>
			</div>
			<div className="ml-6">
				<span className="text-[13px] text-muted-foreground">{description}</span>
			</div>
		</div>
	);
}
