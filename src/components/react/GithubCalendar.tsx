import ActivityCalendar, { type Props, type ThemeInput } from 'react-activity-calendar';
import { useTheme } from '@utils/useTheme';

export function GithubCalendar({ data, ...props }: Props) {
	const colorScheme = useTheme();

	return (
		<ActivityCalendar
			colorScheme={colorScheme}
			data={data}
			blockSize={9}
			blockMargin={3}
			fontSize={12}
			theme={theme}
			style={{
				fontFamily: 'var(--font-departure)',
			}}
			{...props}
		/>
	);
}

const theme: ThemeInput = {
	light: [
		'oklch(0.97 0 0 / 0.5)',
		'oklch(0.88 0.06 254)',
		'oklch(0.71 0.14 255)',
		'oklch(0.55 0.22 263)',
		'oklch(0.42 0.18 266)',
	],
	dark: [
		'oklch(0.2 0 0 / 0.5)',
		'oklch(0.28 0.09 268)',
		'oklch(0.42 0.18 266)',
		'oklch(0.49 0.22 264)',
		'oklch(0.62 0.19 260)',
	],
};
