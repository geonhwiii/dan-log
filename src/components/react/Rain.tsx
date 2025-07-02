export function Rain() {
	return (
		<figure
			className="rain -scale-x-[1] pointer-events-none fixed inset-0 z-50 m-0 h-dvh w-dvw bg-repeat opacity-0 dark:opacity-10"
			style={{
				backgroundImage: 'url(/images/rain.gif)',
				backgroundSize: '6.25rem 6.25rem',
				imageRendering: 'pixelated',
			}}
		/>
	);
}
