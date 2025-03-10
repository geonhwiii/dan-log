export function Rain() {
	return (
		<figure
			style={{
				backgroundImage: 'url(/images/rain.gif)',
				backgroundSize: '6.25rem 6.25rem',
				imageRendering: 'pixelated',
			}}
			className="rain pointer-events-none fixed inset-0 z-50 m-0 h-dvh w-dvw -scale-x-[1] bg-repeat opacity-0 dark:opacity-10"
		/>
	);
}
