import { Hotspot, HealthScoreResult, ContributorGraphData } from './types';

export function calculateHealthScore(
    commitsCount: number,
    hotspots: Hotspot[],
    graphData: ContributorGraphData
): HealthScoreResult {
    // 1. Churn Factor
    // High churn across many files indicates instability.
    const totalChurn = hotspots.reduce((acc, h) => acc + h.totalChanges, 0);
    const normalizedChurn = commitsCount > 0 ? totalChurn / commitsCount : 0;
    const churnPenalty = Math.min(30, normalizedChurn * 2); // Max 30 points penalty

    // 2. Contributor Overlap Factor (from graph data links)
    // High density of links means people are constantly editing the same files (higher risk of stepping on toes, but also good collaboration).
    // Let's penalize *excessive* overlap but reward moderate overlap.
    const totalPossibleLinks = (graphData.nodes.length * (graphData.nodes.length - 1)) / 2;
    const actualLinks = graphData.links.length;
    const overlapRatio = totalPossibleLinks > 0 ? actualLinks / totalPossibleLinks : 0;

    // If everyone is editing everything (>0.8), that's chaotic. If no one collaborates (<0.1), that's siloed.
    let overlapPenalty = 0;
    if (overlapRatio > 0.8) overlapPenalty = 15;
    else if (overlapRatio < 0.1 && graphData.nodes.length > 2) overlapPenalty = 10;
    else overlapPenalty = 0; // Healthy range

    // 3. Hotspot Factor (Technical Debt)
    // If a small number of files represent a massive percentage of total churn, it's a structural hotspot.
    const topHotspotChurn = hotspots.slice(0, 5).reduce((acc, h) => acc + h.totalChanges, 0);
    const hotspotDensity = totalChurn > 0 ? topHotspotChurn / totalChurn : 0;
    const hotspotPenalty = Math.min(35, hotspotDensity * 35); // Max 35 points penalty for extreme centralization

    // Final Calculation
    const healthScore = Math.max(0, Math.round(100 - churnPenalty - overlapPenalty - hotspotPenalty));

    // Determine Grade
    let grade: 'A' | 'B' | 'C' | 'D' = 'D';
    if (healthScore >= 90) grade = 'A';
    else if (healthScore >= 75) grade = 'B';
    else if (healthScore >= 60) grade = 'C';

    // Generate Summary
    let summary = '';
    if (grade === 'A') summary = 'Excellent project health. Churn is distributed, and collaboration is balanced.';
    else if (grade === 'B') summary = 'Good project health. Some files are becoming hotspots, monitor refactoring needs.';
    else if (grade === 'C') summary = 'Fair health. High code churn and centralization detected. Architecural review recommended.';
    else summary = 'Critical health issues. Extreme hotspots and merge conflict risks present. Deep refactoring required.';

    return {
        healthScore,
        grade,
        summary
    };
}
