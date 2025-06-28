import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../utils/useTheme';

export default function WaveBackground() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const theme = useTheme();
	const animationRef = useRef<number | undefined>(undefined);
	const currentThemeRef = useRef(theme);
	const [isLoaded, setIsLoaded] = useState(false);
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

	// 테마 변경 감지
	useEffect(() => {
		currentThemeRef.current = theme;
	}, [theme]);

	// 모션 선호도 감지
	useEffect(() => {
		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		setPrefersReducedMotion(mediaQuery.matches);

		const handleChange = (e: MediaQueryListEvent) => {
			setPrefersReducedMotion(e.matches);
		};

		mediaQuery.addEventListener('change', handleChange);
		return () => mediaQuery.removeEventListener('change', handleChange);
	}, []);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		let time = 0;
		const waveData = Array.from({ length: 8 }).map(() => ({
			value: Math.random() * 0.5 + 0.1,
			targetValue: Math.random() * 0.5 + 0.1,
			speed: Math.random() * 0.02 + 0.01,
		}));

		function resizeCanvas() {
			if (!canvas) return;
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		}

		function updateWaveData() {
			for (const data of waveData) {
				if (Math.random() < 0.01) data.targetValue = Math.random() * 0.7 + 0.1;
				const diff = data.targetValue - data.value;
				data.value += diff * data.speed;
			}
		}

		function draw() {
			if (!canvas || !ctx) return;

			// 배경을 투명하게 변경
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// 모션 감소 선호 시 정적 웨이브 표시
			if (prefersReducedMotion) {
				ctx.beginPath();
				for (let x = 0; x < canvas.width; x++) {
					const nx = (x / canvas.width) * 2 - 1;
					const py = Math.sin(nx * 5) * 0.1;
					const y = ((py + 1) * canvas.height) / 2;
					x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
				}
				ctx.lineWidth = 2;
				ctx.strokeStyle = 'rgba(79,70,229,0.6)';
				ctx.stroke();
				return;
			}

			for (let i = 0; i < waveData.length; i++) {
				const data = waveData[i];
				const freq = data.value * 7;
				ctx.beginPath();
				for (let x = 0; x < canvas.width; x++) {
					const nx = (x / canvas.width) * 2 - 1;
					const px = nx + i * 0.04 + freq * 0.03;
					const py = Math.sin(px * 10 + time) * Math.cos(px * 2) * freq * 0.1 * ((i + 1) / 8);
					const y = ((py + 1) * canvas.height) / 2;
					x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
				}
				const intensity = Math.min(1, freq * 0.3);
				const r = 79 + intensity * 100;
				const g = 70 + intensity * 130;
				const b = 229;
				ctx.lineWidth = 1 + i * 0.3;
				ctx.strokeStyle = `rgba(${r},${g},${b},0.6)`;
				ctx.shadowColor = `rgba(${r},${g},${b},0.5)`;
				ctx.shadowBlur = 5;
				ctx.stroke();
				ctx.shadowBlur = 0;
			}
		}

		function animate() {
			if (prefersReducedMotion) {
				draw();
				return;
			}

			time += 0.02;
			updateWaveData();
			draw();
			animationRef.current = requestAnimationFrame(animate);
		}

		window.addEventListener('resize', resizeCanvas);
		resizeCanvas();
		animate();

		// 로딩 완료 표시
		setIsLoaded(true);

		return () => {
			window.removeEventListener('resize', resizeCanvas);
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current);
			}
		};
	}, [prefersReducedMotion]);

	return (
		<canvas
			ref={canvasRef}
			className={`fixed inset-0 w-full h-full transition-opacity duration-500 ${
				isLoaded ? 'opacity-100' : 'opacity-0'
			}`}
		/>
	);
}
