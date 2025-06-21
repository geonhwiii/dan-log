import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { differenceInMonths, differenceInYears, isValid } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatDate(date: Date) {
	return Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: '2-digit',
		year: 'numeric',
	}).format(date);
}

export function readingTime(html: string) {
	const textOnly = html.replace(/<[^>]+>/g, '');
	const wordCount = textOnly.split(/\s+/).length;
	const readingTimeMinutes = (wordCount / 200 + 1).toFixed();
	return `${readingTimeMinutes} min read`;
}

/**
 * 근무 시작일과 종료일을 기준으로 근무 기간을 계산합니다.
 * @param dateStart 근무 시작일
 * @param dateEnd 근무 종료일 ("재직중"인 경우 현재 날짜 사용)
 * @returns 근무 기간 (예: "2년 3개월", "1개월 미만")
 */
export function calculateWorkPeriod(dateStart: string | Date, dateEnd: string | Date) {
	// 시작 날짜 처리
	const start = typeof dateStart === 'string' ? new Date(dateStart) : dateStart;

	// 종료 날짜 처리 ("재직중"인 경우 현재 날짜 사용)
	let end: Date;
	if (dateEnd === '재직중') {
		end = new Date();
	} else {
		end = typeof dateEnd === 'string' ? new Date(dateEnd) : dateEnd;
	}

	// 날짜가 유효한지 확인
	if (!isValid(start) || !isValid(end)) {
		return '날짜 형식 오류';
	}

	// date-fns를 사용하여 년, 월 계산
	const years = differenceInYears(end, start);
	const months = differenceInMonths(end, start) % 12;

	// 결과 문자열 생성
	const yearText = years > 0 ? `${years}년` : '';
	const monthText = months > 0 ? `${months}개월` : '';

	const result = [yearText, monthText].filter(Boolean).join(' ');

	return result || '1개월 미만';
}

/**
 * 날짜를 한국어 형식으로 포맷팅합니다. (예: "2023년 3월")
 * @param input 날짜 또는 날짜 문자열
 * @returns 포맷팅된 날짜 문자열
 */
export function formatWorkDate(input: Date | string) {
	if (typeof input === 'string') return input;

	if (!isValid(input)) return '날짜 형식 오류';

	const month = input.toLocaleDateString('ko-KR', {
		month: 'short',
	});

	const year = input.getFullYear();
	return `${year}년 ${month}`;
}
