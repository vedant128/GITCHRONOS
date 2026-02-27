import { OpenAI } from 'openai';
import { CommitData, CommitSentimentResult } from './types';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'fake-key',
});

function generateMockSentiment(commits: CommitData[]): CommitSentimentResult {
    const distribution = {
        Refactor: 0,
        BugFix: 0,
        Feature: 0,
        Hack: 0,
        Patch: 0
    };

    commits.forEach(c => {
        const msg = c.message.toLowerCase();
        if (msg.includes('fix') || msg.includes('bug')) distribution.BugFix++;
        else if (msg.includes('feat') || msg.includes('add')) distribution.Feature++;
        else if (msg.includes('refactor') || msg.includes('clean')) distribution.Refactor++;
        else if (msg.includes('hack') || msg.includes('temp')) distribution.Hack++;
        else if (msg.includes('patch') || msg.includes('hotfix')) distribution.Patch++;
        else distribution.Feature++; // default
    });

    const totalReact = distribution.BugFix + distribution.Hack + distribution.Patch;
    const reactiveMaintenanceScore = commits.length > 0 ? (totalReact / commits.length) * 100 : 0;

    return {
        sentimentDistribution: distribution,
        reactiveMaintenanceScore: Math.round(reactiveMaintenanceScore)
    };
}

export async function analyzeCommitSentiment(commits: CommitData[]): Promise<CommitSentimentResult> {
    if (!process.env.OPENAI_API_KEY || commits.length === 0) {
        return generateMockSentiment(commits);
    }

    // OpenAI token limits. Only send a random sample of up to 100 commits.
    const sampleSize = Math.min(100, commits.length);
    const sampledCommits = [...commits].sort(() => 0.5 - Math.random()).slice(0, sampleSize);

    const commitMessages = sampledCommits.map(c => `- ${c.message}`).join('\n');

    const prompt = `Classify the following ${sampleSize} git commit messages into exactly ONE of these categories: [Refactor, BugFix, Feature, Hack, Patch].
    Return a JSON object containing a 'sentimentDistribution' map with the count for each category, and a 'reactiveMaintenanceScore' from 0-100 indicating how chaotic/reactive the development is (BugFix, Hack, Patch indicate reactive work).
    
    Commit Messages:
    ${commitMessages}
    `;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
        });

        const data = JSON.parse(response.choices[0].message.content || '{}');
        return data as CommitSentimentResult;
    } catch (error) {
        console.error("AI Sentiment Analysis failed:", error);
        return generateMockSentiment(commits); // Fallback to mock logic on failure
    }
}
