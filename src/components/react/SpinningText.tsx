'use client';
import { cn } from '@/lib/utils';
import { motion, type Transition, type Variants } from 'motion/react';
import type { CSSProperties } from 'react';

type SpinningTextProps = {
	text: string;
	style?: CSSProperties;
	duration?: number;
	className?: string;
	reverse?: boolean;
	fontSize?: number;
	radius?: number;
	transition?: Transition;
	variants?: {
		container?: Variants;
		item?: Variants;
	};
};

const BASE_TRANSITION = {
	repeat: Number.POSITIVE_INFINITY,
	ease: 'linear',
};

const BASE_ITEM_VARIANTS = {
	hidden: {
		opacity: 1,
	},
	visible: {
		opacity: 1,
	},
};

export function SpinningText({
	text,
	duration = 10,
	style,
	className,
	reverse = false,
	radius = 5,
	transition,
	variants,
}: SpinningTextProps) {
	const letters = text.split('');
	letters.push(' ');
	const finalTransition = {
		...BASE_TRANSITION,
		...transition,
		duration: (transition as { duration?: number })?.duration ?? duration,
	};
	const containerVariants = {
		visible: { rotate: reverse ? -360 : 360 },
		...variants?.container,
	};
	const itemVariants = {
		...BASE_ITEM_VARIANTS,
		...variants?.item,
	};
	return (
		<motion.div
			className={cn('relative', className)}
			style={style}
			initial="hidden"
			animate="visible"
			variants={containerVariants}
			transition={finalTransition}
		>
			{letters.map((letter, index) => (
				<motion.span
					aria-hidden="true"
					key={`${index}-${letter}`}
					variants={itemVariants}
					className="absolute left-1/2 top-1/2 inline-block"
					style={
						{
							'--index': index,
							'--total': letters.length,
							'--radius': radius,
							transform: `
                  translate(-50%, -50%)
                  rotate(calc(360deg / var(--total) * var(--index)))
                  translateY(calc(var(--radius, 5) * -1ch))
                `,
							transformOrigin: 'center',
						} as React.CSSProperties
					}
				>
					{letter}
				</motion.span>
			))}
			<span className="sr-only">{text}</span>
		</motion.div>
	);
}
