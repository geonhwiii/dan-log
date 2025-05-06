import { useEffect, useState } from 'react';

export function useTheme() {
	const [theme, setTheme] = useState<'light' | 'dark'>('light');

	useEffect(() => {
		const isDark = document.documentElement.classList.contains('dark');
		setTheme(isDark ? 'dark' : 'light');

		const observer = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				if (mutation.attributeName === 'class') {
					const isDark = document.documentElement.classList.contains('dark');
					setTheme(isDark ? 'dark' : 'light');
				}
			}
		});

		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class'],
		});

		return () => observer.disconnect();
	}, []);

	return theme;
}
