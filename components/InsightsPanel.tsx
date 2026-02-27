'use client';
import React from 'react';
import { AIInsight } from '@/lib/types';
import { AlertTriangle, Lightbulb, Activity, Wrench } from 'lucide-react';

interface Props {
    insights: AIInsight | null;
    loading: boolean;
}

export default function InsightsPanel({ insights, loading }: Props) {
    return (
        <div className="w-full rounded-2xl bg-gray-900/40 backdrop-blur-md border border-gray-800 p-6 flex flex-col gap-6 h-full min-h-[400px]">
            <h3 className="text-gray-300 text-sm tracking-widest uppercase font-semibold border-b border-gray-800 pb-2">AI Insights</h3>

            {loading && (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-pulse flex flex-col items-center gap-3">
                        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                        <p className="text-cyan-400/50 text-xs">Analyzing repository...</p>
                    </div>
                </div>
            )}

            {!loading && insights && (
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6 pr-2">

                    <div className="flex flex-col gap-2">
                        <h4 className="text-red-400 text-xs uppercase flex items-center gap-2 font-bold mb-1">
                            <AlertTriangle size={14} /> Technical Debt Risks
                        </h4>
                        {insights.technicalDebtRisks?.map((item: string, i: number) => (
                            <p key={i} className="text-gray-400 text-sm bg-red-500/10 p-3 rounded-md border border-red-500/20 leading-relaxed font-medium">{item}</p>
                        ))}
                    </div>

                    <div className="flex flex-col gap-2">
                        <h4 className="text-orange-400 text-xs uppercase flex items-center gap-2 font-bold mb-1">
                            <Activity size={14} /> Maintenance Hotspots
                        </h4>
                        {insights.maintenanceHotspots?.map((item: string, i: number) => (
                            <p key={i} className="text-gray-400 text-sm bg-orange-500/10 p-3 rounded-md border border-orange-500/20 leading-relaxed">{item}</p>
                        ))}
                    </div>

                    <div className="flex flex-col gap-2">
                        <h4 className="text-green-400 text-xs uppercase flex items-center gap-2 font-bold mb-1">
                            <Lightbulb size={14} /> Team Productivity
                        </h4>
                        {insights.teamProductivityPatterns?.map((item: string, i: number) => (
                            <p key={i} className="text-gray-400 text-sm bg-green-500/10 p-3 rounded-md border border-green-500/20 leading-relaxed">{item}</p>
                        ))}
                    </div>

                    <div className="flex flex-col gap-2">
                        <h4 className="text-blue-400 text-xs uppercase flex items-center gap-2 font-bold mb-1">
                            <Wrench size={14} /> Refactoring Suggestions
                        </h4>
                        {insights.refactoringSuggestions?.map((item: string, i: number) => (
                            <p key={i} className="text-gray-400 text-sm bg-blue-500/10 p-3 rounded-md border border-blue-500/20 leading-relaxed">{item}</p>
                        ))}
                    </div>

                </div>
            )}

            {!loading && !insights && (
                <div className="flex-1 flex items-center justify-center text-gray-600 text-sm text-center">
                    No insights generated yet.<br />Load a repository to analyze.
                </div>
            )}
        </div>
    );
}
