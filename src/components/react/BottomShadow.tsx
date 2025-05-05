export function BottomShadow() {
	return (
		<div
			className="w-full h-24 will-change-transform fixed bottom-0 right-0 z-[1] isolate pointer-events-none backdrop-blur-sm transition-colors duration-300 ease-in-out"
			style={{
				transform: 'translateZ(0px)',
				maskImage: 'linear-gradient(rgba(0, 0, 0, 0) 0%, black 100%)',
			}}
		/>
	);
}
