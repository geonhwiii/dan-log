import { cn } from '@lib/utils';
import { createEffect, createSignal, type Component } from 'solid-js';
import { Motion } from 'solid-motionone';

interface TrueFocusProps {
	className?: string;
	sentence?: string;
	blurAmount?: number;
	borderColor?: string;
	animationDuration?: number;
}

const TrueFocus: Component<TrueFocusProps> = ({
	className,
	sentence = 'True Focus',
	blurAmount = 5,
	borderColor = 'green',
	animationDuration = 0.5,
}) => {
	const words = sentence.split(' ');
	const [currentIndex, setCurrentIndex] = createSignal<number>(0);
	const [lastActiveIndex, setLastActiveIndex] = createSignal<number | null>(null);
	let wordRefs: (HTMLSpanElement | undefined)[] = [];
	let containerRef: HTMLDivElement | undefined;

	const [focusRect, setFocusRect] = createSignal({
		x: 0,
		y: 0,
		width: 0,
		height: 0,
		opacity: 0,
	});

	createEffect(() => {
		const index = currentIndex();
		if (index === null || index === -1 || !containerRef || !wordRefs[index]) return;

		const parentRect = containerRef.getBoundingClientRect();
		const activeRect = wordRefs[index]!.getBoundingClientRect();
		setFocusRect({
			x: activeRect.left - parentRect.left,
			y: activeRect.top - parentRect.top,
			width: activeRect.width,
			height: activeRect.height,
			opacity: 1,
		});
	});

	const handleMouseEnter = (index: number) => {
		setLastActiveIndex(index);
		setCurrentIndex(index);
	};

	const handleMouseLeave = () => {
		const lastIndex = lastActiveIndex();
		if (lastIndex !== null) {
			setCurrentIndex(lastIndex);
		}
	};
	return (
		<div ref={(el) => (containerRef = el)} class="relative flex gap-4 justify-center items-center flex-wrap">
			{words.map((word, index) => {
				const isActive = index === currentIndex();
				return (
					// biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
					<span
						ref={(el) => (wordRefs[index] = el)}
						class={cn('relative will-change-transform', className)}
						style={{
							filter: isActive ? 'blur(0px)' : `blur(${blurAmount}px)`,
							transition: `all ${animationDuration}s ease`,
							'will-change': 'filter',
						}}
						onMouseEnter={[handleMouseEnter, index]}
						onMouseLeave={handleMouseLeave}
					>
						{word}
					</span>
				);
			})}

			<Motion.div
				animate={{
					x: focusRect().x,
					y: focusRect().y,
					width: focusRect().width,
					height: focusRect().height,
					opacity: focusRect().opacity,
				}}
				transition={{
					duration: animationDuration,
				}}
				class="absolute top-0 left-0 pointer-events-none rounded-md"
				style={{
					width: `${focusRect().width}px`,
					height: `${focusRect().height}px`,
					opacity: focusRect().opacity,
				}}
			>
				<span
					class="absolute w-4 h-4 border-[3px] rounded-[3px] top-[-10px] left-[-10px] border-r-0 border-b-0"
					style={{
						'border-color': borderColor,
						filter: `drop-shadow(0 0 4px ${borderColor})`,
					}}
				/>
				<span
					class="absolute w-4 h-4 border-[3px] rounded-[3px] top-[-10px] right-[-10px] border-l-0 border-b-0"
					style={{
						'border-color': borderColor,
						filter: `drop-shadow(0 0 4px ${borderColor})`,
					}}
				/>
				<span
					class="absolute w-4 h-4 border-[3px] rounded-[3px] bottom-[-10px] left-[-10px] border-r-0 border-t-0"
					style={{
						'border-color': borderColor,
						filter: `drop-shadow(0 0 4px ${borderColor})`,
					}}
				/>
				<span
					class="absolute w-4 h-4 border-[3px] rounded-[3px] bottom-[-10px] right-[-10px] border-l-0 border-t-0"
					style={{
						'border-color': borderColor,
						filter: `drop-shadow(0 0 4px ${borderColor})`,
					}}
				/>
			</Motion.div>
		</div>
	);
};

export default TrueFocus;
