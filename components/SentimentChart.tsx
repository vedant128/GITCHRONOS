import React from 'react';
import { CommitSentimentResult } from '@/lib/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

interface Props {
    sentimentData: CommitSentimentResult;
}

const SENTIMENT_COLORS = {
    Refactor: '#3b82f6', // blue
    BugFix: '#ef4444',   // red
    Feature: '#10b981',  // green
    Hack: '#f97316',     // orange
    Patch: '#eab308'     // yellow
};

export default function SentimentChart({ sentimentData }: Props) {
    const { sentimentDistribution, reactiveMaintenanceScore } = sentimentData;

    const chartData = [
        { name: 'Refactor', value: sentimentDistribution.Refactor, color: SENTIMENT_COLORS.Refactor },
        { name: 'BugFix', value: sentimentDistribution.BugFix, color: SENTIMENT_COLORS.BugFix },
        { name: 'Feature', value: sentimentDistribution.Feature, color: SENTIMENT_COLORS.Feature },
        { name: 'Hack', value: sentimentDistribution.Hack, color: SENTIMENT_COLORS.Hack },
        { name: 'Patch', value: sentimentDistribution.Patch, color: SENTIMENT_COLORS.Patch }
    ].filter(d => d.value > 0);

    return (
        <div className="w-full rounded-2xl bg-gray-900/40 backdrop-blur-md border border-gray-800 p-6 flex flex-col relative h-full min-h-[300px]">
            <div className="flex justify-between items-center mb-4 relative z-10 text-gray-300 tracking-widest uppercase font-semibold text-sm">
                <h3>Commit Sentiment</h3>
                {reactiveMaintenanceScore > 0 && (
                    <div className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${reactiveMaintenanceScore > 40 ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                            reactiveMaintenanceScore > 20 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                                'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                        Reactive Load: {reactiveMaintenanceScore}%
                    </div>
                )}
            </div>

            {chartData.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                    No classification data available
                </div>
            ) : (
                <div className="flex-1 w-full min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <RechartsTooltip
                                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', color: '#9ca3af' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
