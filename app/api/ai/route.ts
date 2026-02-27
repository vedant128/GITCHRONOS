import { NextResponse } from 'next/server';
import { generateAIInsights } from '@/lib/aiService';
import { analyzeCommitSentiment } from '@/lib/sentimentAnalyzer';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { hotspots, graphData, commitsCount, commits } = body;

        if (!hotspots || !graphData || !commits) {
            return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
        }

        const [insights, sentimentData] = await Promise.all([
            generateAIInsights(hotspots, graphData, commitsCount || 0),
            analyzeCommitSentiment(commits)
        ]);

        return NextResponse.json({ success: true, insights, sentimentData });
    } catch (error: any) {
        console.error('Error generating AI insights:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
