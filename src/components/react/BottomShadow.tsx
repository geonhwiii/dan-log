export function BottomShadow() {
	return (
		<div
			className="pointer-events-none fixed right-0 bottom-0 isolate z-[1] h-24 w-full backdrop-blur-sm transition-colors duration-300 ease-in-out will-change-transform"
			style={{
				transform: 'translateZ(0px)',
				maskImage: 'linear-gradient(rgba(0, 0, 0, 0) 0%, black 100%)',
			}}
		/>
	);
}
