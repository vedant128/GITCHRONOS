import { CommitData, BranchComparisonResult, Hotspot } from './types';

export function compareBranches(
    baseCommits: CommitData[],
    compareCommits: CommitData[],
    baseHotspots: Hotspot[],
    compareHotspots: Hotspot[]
): BranchComparisonResult {
    // Basic commit count delta
    const commitDelta = compareCommits.length - baseCommits.length;

    // Churn calculation
    const baseChurn = baseHotspots.reduce((acc, h) => acc + h.totalChanges, 0);
    const compareChurn = compareHotspots.reduce((acc, h) => acc + h.totalChanges, 0);
    const churnDelta = compareChurn - baseChurn;

    // Contributor calculation
    const baseContributors = new Set<string>();
    baseCommits.forEach(c => baseContributors.add(c.author_name));

    const compareContributors = new Set<string>();
    compareCommits.forEach(c => compareContributors.add(c.author_name));

    const contributorDelta = compareContributors.size - baseContributors.size;

    // Hotspot delta
    const hotspotDelta = compareHotspots.length - baseHotspots.length;

    return {
        commitDelta,
        churnDelta,
        contributorDelta,
        hotspotDelta,
        baseCommits: baseCommits.length,
        compareCommits: compareCommits.length
    };
}
