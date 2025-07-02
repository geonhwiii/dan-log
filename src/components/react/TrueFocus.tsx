import { cn } from '@lib/utils';
import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

type TrueFocusProps = {
	className?: string;
	sentence?: string;
	manualMode?: boolean;
	blurAmount?: number;
	borderColor?: string;
	glowColor?: string;
	animationDuration?: number;
	pauseBetweenAnimations?: number;
};

type FocusRect = {
	x: number;
	y: number;
	width: number;
	height: number;
};

const TrueFocus: React.FC<TrueFocusProps> = ({
	className,
	sentence = 'True Focus',
	manualMode = false,
	blurAmount = 5,
	borderColor = 'green',
	glowColor = 'rgba(0, 255, 0, 0.6)',
	animationDuration = 0.5,
	pauseBetweenAnimations = 1,
}) => {
	const words = sentence.split(' ');
	const [currentIndex, setCurrentIndex] = useState<number>(0);
	const [lastActiveIndex, setLastActiveIndex] = useState<number | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
	const [focusRect, setFocusRect] = useState<FocusRect>({ x: 0, y: 0, width: 0, height: 0 });

	useEffect(() => {
		if (!manualMode) {
			const interval = setInterval(
				() => {
					setCurrentIndex((prev) => (prev + 1) % words.length);
				},
				(animationDuration + pauseBetweenAnimations) * 1000,
			);

			return () => clearInterval(interval);
		}
	}, [manualMode, animationDuration, pauseBetweenAnimations, words.length]);

	useEffect(() => {
		if (currentIndex === null || currentIndex === -1) {
			return;
		}
		if (!(wordRefs.current[currentIndex] && containerRef.current)) {
			return;
		}

		const parentRect = containerRef.current.getBoundingClientRect();
		const activeRect = wordRefs.current[currentIndex]!.getBoundingClientRect();

		setFocusRect({
			x: activeRect.left - parentRect.left,
			y: activeRect.top - parentRect.top,
			width: activeRect.width,
			height: activeRect.height,
		});
	}, [currentIndex, words.length]);

	const handleMouseEnter = (index: number) => {
		if (manualMode) {
			setLastActiveIndex(index);
			setCurrentIndex(index);
		}
	};

	const handleMouseLeave = () => {
		if (manualMode) {
			setCurrentIndex(lastActiveIndex!);
		}
	};

	return (
		<div className="relative flex flex-wrap items-center justify-center gap-4" ref={containerRef}>
			{words.map((word, index) => {
				const isActive = index === currentIndex;
				return (
					<span
						className={cn('relative cursor-pointer font-black text-[3rem]', className)}
						key={index}
						onMouseEnter={() => handleMouseEnter(index)}
						onMouseLeave={handleMouseLeave}
						ref={(el) => {
							wordRefs.current[index] = el;
						}}
						style={
							{
								filter: manualMode
									? isActive
										? 'blur(0px)'
										: `blur(${blurAmount}px)`
									: isActive
										? 'blur(0px)'
										: `blur(${blurAmount}px)`,
								transition: `filter ${animationDuration}s ease`,
							} as React.CSSProperties
						}
					>
						{word}
					</span>
				);
			})}

			<motion.div
				animate={{
					x: focusRect.x,
					y: focusRect.y,
					width: focusRect.width,
					height: focusRect.height,
					opacity: currentIndex >= 0 ? 1 : 0,
				}}
				className="pointer-events-none absolute top-0 left-0 box-border border-0"
				style={
					{
						'--border-color': borderColor,
						'--glow-color': glowColor,
					} as React.CSSProperties
				}
				transition={{
					duration: animationDuration,
				}}
			>
				<span
					className="absolute top-[-10px] left-[-10px] h-4 w-4 rounded-[3px] border-[3px] border-r-0 border-b-0"
					style={{
						borderColor: 'var(--border-color)',
						filter: 'drop-shadow(0 0 4px var(--border-color))',
					}}
				/>
				<span
					className="absolute top-[-10px] right-[-10px] h-4 w-4 rounded-[3px] border-[3px] border-b-0 border-l-0"
					style={{
						borderColor: 'var(--border-color)',
						filter: 'drop-shadow(0 0 4px var(--border-color))',
					}}
				/>
				<span
					className="absolute bottom-[-10px] left-[-10px] h-4 w-4 rounded-[3px] border-[3px] border-t-0 border-r-0"
					style={{
						borderColor: 'var(--border-color)',
						filter: 'drop-shadow(0 0 4px var(--border-color))',
					}}
				/>
				<span
					className="absolute right-[-10px] bottom-[-10px] h-4 w-4 rounded-[3px] border-[3px] border-t-0 border-l-0"
					style={{
						borderColor: 'var(--border-color)',
						filter: 'drop-shadow(0 0 4px var(--border-color))',
					}}
				/>
			</motion.div>
		</div>
	);
};

export default TrueFocus;
