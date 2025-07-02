'use client';
import { motion, type Transition, type Variants } from 'motion/react';
import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

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
			animate="visible"
			className={cn('relative', className)}
			initial="hidden"
			style={style}
			transition={finalTransition as Transition}
			variants={containerVariants}
		>
			{letters.map((letter, index) => (
				<motion.span
					aria-hidden="true"
					className="absolute top-1/2 left-1/2 inline-block"
					key={`${index}-${letter}`}
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
					variants={itemVariants}
				>
					{letter}
				</motion.span>
			))}
			<span className="sr-only">{text}</span>
		</motion.div>
	);
}
