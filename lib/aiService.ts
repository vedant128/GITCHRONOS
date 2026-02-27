import { OpenAI } from 'openai';
import { AIInsight, Hotspot, ContributorGraphData } from './types';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'fake-key',
});

export async function generateAIInsights(hotspots: Hotspot[], graphData: ContributorGraphData, commitsCount: number): Promise<AIInsight> {
    if (!process.env.OPENAI_API_KEY) {
        // Return mock data for demo if key isn't provided
        return {
            technicalDebtRisks: [
                `High risk in top ${Math.min(3, hotspots.length)} heavily modified files.`,
                `Large number of contributors (${graphData.nodes.length}) leading to potential siloed knowledge.`
            ],
            maintenanceHotspots: hotspots.slice(0, 3).map(h => `${h.fileName} (Score: ${h.score}) is a massive hotspot.`),
            teamProductivityPatterns: [
                `${graphData.nodes.length > 5 ? 'High collaboration' : 'Small team dynamics'} detected.`,
                `${commitsCount} commits analyzed showing consistent activity.`
            ],
            refactoringSuggestions: [
                `Consider extracting utilities from ${hotspots[0]?.fileName || 'core modules'}.`,
                'Modularize frequently changing components to reduce blast radius.'
            ]
        };
    }

    try {
        const prompt = `Analyze this code repository data for technical debt.
    Analyzed ${commitsCount} commits.
    Top Hotspots: ${JSON.stringify(hotspots.slice(0, 5).map(h => ({ file: h.fileName, changes: h.totalChanges, contributors: h.contributorCount })))}
    Contributors Count: ${graphData.nodes.length}
    Please return a JSON object with: 
    - technicalDebtRisks (array of strings)
    - maintenanceHotspots (array of strings)
    - teamProductivityPatterns (array of strings)
    - refactoringSuggestions (array of strings)`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
        });

        return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
        console.error("AI Insight generation failed:", error);
        throw error;
    }
}
