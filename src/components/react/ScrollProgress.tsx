'use client';

import { cn } from '@/lib/utils';
import { motion, type MotionProps, useScroll } from 'motion/react';
interface ScrollProgressProps extends Omit<React.HTMLAttributes<HTMLElement>, keyof MotionProps> {}

export const ScrollProgress = ({ className, ...props }: ScrollProgressProps) => {
	const { scrollYProgress } = useScroll();

	return (
		<motion.div
			className={cn(
				'fixed inset-x-0 top-0 z-50 h-px origin-left bg-gradient-to-r dark:from-[#4B0082] dark:via-[#D400FF] dark:to-[#FF1493] from-[#f7f79e] via-[#a7d15c] to-[#49a01b]',
				className,
			)}
			style={{
				scaleX: scrollYProgress,
			}}
			{...props}
		/>
	);
};

ScrollProgress.displayName = 'ScrollProgress';
