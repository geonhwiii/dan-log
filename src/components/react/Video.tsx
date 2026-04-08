interface VideoProps {
	src: string;
	caption?: string;
	autoPlay?: boolean;
	loop?: boolean;
	muted?: boolean;
	controls?: boolean;
}

export const Video = ({ src, caption, autoPlay = true, loop = true, muted = true, controls = true }: VideoProps) => {
	return (
		<figure className="overflow-hidden rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.2)] backdrop-blur-sm">
			<video
				autoPlay={autoPlay}
				className="w-full "
				controls={controls}
				loop={loop}
				muted={muted}
				playsInline
				src={src}
			/>
			{caption && (
				<figcaption className="mt-2 text-center text-black/50 text-sm dark:text-white/50">{caption}</figcaption>
			)}
		</figure>
	);
};
