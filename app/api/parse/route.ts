import { NextResponse } from 'next/server';
import { cloneAndParseRepo } from '@/lib/gitParser';
import { analyzeHotspots, generateContributorGraph } from '@/lib/hotspotAnalyzer';
import { analyzeBusFactor } from '@/lib/busFactorAnalyzer';
import { analyzeMergeRisk } from '@/lib/mergeRisk';
import { calculateHealthScore } from '@/lib/healthScore';
import { analyzeProductivity } from '@/lib/productivityAnalyzer';
import { compareBranches } from '@/lib/branchComparator';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { repoUrl, branch, compareBranch } = body;

        if (!repoUrl) {
            return NextResponse.json({ error: 'repoUrl is required' }, { status: 400 });
        }

        console.log(`Cloning and parsing repo: ${repoUrl} [Branch: ${branch || 'default'}]`);
        const baseCommits = await cloneAndParseRepo(repoUrl, branch);
        const baseHotspots = analyzeHotspots(baseCommits);
        const baseGraphData = generateContributorGraph(baseCommits);

        const busFactorData = analyzeBusFactor(baseCommits);
        const mergeRiskData = analyzeMergeRisk(baseCommits);
        const healthScoreData = calculateHealthScore(baseCommits.length, baseHotspots, baseGraphData);
        const productivityData = analyzeProductivity(baseCommits);

        let branchComparisonData = null;
        if (compareBranch) {
            console.log(`Cloning and parsing compare branch: ${compareBranch}`);
            const compareCommits = await cloneAndParseRepo(repoUrl, compareBranch);
            const compareHotspots = analyzeHotspots(compareCommits);
            branchComparisonData = compareBranches(baseCommits, compareCommits, baseHotspots, compareHotspots);
        }

        return NextResponse.json({
            success: true,
            commitsCount: baseCommits.length,
            commits: baseCommits,
            hotspots: baseHotspots,
            graphData: baseGraphData,
            busFactorData,
            mergeRiskData,
            healthScoreData,
            productivityData,
            branchComparisonData
        });
    } catch (error: any) {
        console.error('Error during repo parsing:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
