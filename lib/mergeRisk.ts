import { CommitData, MergeRiskResult } from './types';

export function analyzeMergeRisk(commits: CommitData[]): MergeRiskResult[] {
    // We want to detect files edited by *multiple* different authors within a short time window.
    // Let's sort commits by date descending to focus on recent history.
    const sortedCommits = [...commits].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Only analyze the most recent 100 commits or 14 days, whichever comes first, as "merge risk" 
    // applies mostly to active, current work.
    const RECENT_DAYS = 14;
    const recentLimitMs = new Date().getTime() - (RECENT_DAYS * 24 * 60 * 60 * 1000);

    let activeCommits = sortedCommits.filter(c => new Date(c.date).getTime() > recentLimitMs);
    if (activeCommits.length === 0) {
        // Fallback to recent 50 commits if the repo hasn't been touched in 14 days
        activeCommits = sortedCommits.slice(0, 50);
    }

    const fileActivity = new Map<string, Map<string, number>>(); // file -> (author -> editCount)

    activeCommits.forEach(c => {
        c.filesChanged.forEach(fc => {
            if (!fileActivity.has(fc.fileName)) {
                fileActivity.set(fc.fileName, new Map());
            }
            const authors = fileActivity.get(fc.fileName)!;
            authors.set(c.author_name, (authors.get(c.author_name) || 0) + 1);
        });
    });

    const risks: MergeRiskResult[] = [];

    fileActivity.forEach((authorsMap, file) => {
        const uniqueAuthors = Array.from(authorsMap.keys());
        if (uniqueAuthors.length > 1) {
            // File is being edited by multiple people recently. High probability of merge conflicts.
            // Risk score formula: (number of unique authors * 10) + (total number of edits on this file)
            const totalEdits = Array.from(authorsMap.values()).reduce((a, b) => a + b, 0);
            const riskScore = (uniqueAuthors.length * 15) + (totalEdits * 2);

            risks.push({
                file,
                concurrentEditors: uniqueAuthors.length,
                riskScore,
                recentEditors: uniqueAuthors
            });
        }
    });

    risks.sort((a, b) => b.riskScore - a.riskScore);

    return risks.slice(0, 10); // Return top 10 riskiest files
}
