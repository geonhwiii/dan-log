interface Contribution {
	date: string;
	contributionCount: number;
	contributionLevel: 'NONE' | 'FIRST_QUARTILE' | 'SECOND_QUARTILE' | 'THIRD_QUARTILE' | 'FOURTH_QUARTILE';
}

interface ProcessedContribution {
	date: string;
	count: number;
	level: number;
}

interface GithubResponse {
	contributions: Contribution[][];
}

const convertLevel = (level: Contribution['contributionLevel']): number => {
	const map = {
		NONE: 0,
		FIRST_QUARTILE: 1,
		SECOND_QUARTILE: 2,
		THIRD_QUARTILE: 3,
		FOURTH_QUARTILE: 4,
	};
	return map[level] ?? 0;
};

export const fetchGithubContributions = async (username: string): Promise<ProcessedContribution[]> => {
	const response = await fetch(`https://github-contributions-api.deno.dev/${username}.json`);
	const raw: GithubResponse = await response.json();

	const flattened = raw.contributions.reduce((acc: Contribution[], row: Contribution[]) => acc.concat(row), []);

	return flattened.map((item: Contribution) => ({
		date: item.date,
		count: item.contributionCount,
		level: convertLevel(item.contributionLevel),
	}));
};
