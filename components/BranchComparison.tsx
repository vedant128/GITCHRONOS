import React from 'react';
import { BranchComparisonResult } from '@/lib/types';
import { GitBranch, GitCommit, GitMerge, Flame } from 'lucide-react';

interface Props {
    branchData: BranchComparisonResult;
    baseName: string;
    compareName: string;
}

export default function BranchComparison({ branchData, baseName, compareName }: Props) {
    const { commitDelta, churnDelta, contributorDelta, hotspotDelta, baseCommits, compareCommits } = branchData;

    const renderMetric = (label: string, delta: number, icon: React.ReactNode, invertColors = false) => {
        const isPositive = delta > 0;
        const isZero = delta === 0;

        // Some metrics like churn increase are bad (red), commit increase is neutral/good (green)
        let colorClass = 'text-gray-400';
        if (!isZero) {
            if (invertColors) {
                colorClass = isPositive ? 'text-red-400 bg-red-500/10' : 'text-green-400 bg-green-500/10';
            } else {
                colorClass = isPositive ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10';
            }
        }

        return (
            <div className="flex flex-col bg-gray-900/50 rounded-xl p-4 border border-gray-800">
                <div className="flex items-center gap-2 text-gray-500 text-xs uppercase font-mono mb-2">
                    {icon} {label}
                </div>
                <div className="flex items-end gap-3">
                    <span className="text-2xl font-black text-white">
                        {isPositive ? '+' : ''}{delta.toLocaleString()}
                    </span>
                    {!isZero && (
                        <span className={`text-xs px-2 py-0.5 rounded-sm font-bold ${colorClass}`}>
                            {isPositive ? 'Higher' : 'Lower'}
                        </span>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="w-full rounded-2xl bg-gray-900/40 backdrop-blur-md border border-gray-800 p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-300 tracking-widest uppercase font-semibold text-sm flex items-center gap-2">
                    <GitBranch size={16} className="text-violet-400" /> Branch Diff
                </h3>
            </div>

            <div className="flex items-center gap-4 mb-8 bg-black/40 rounded-xl p-4 border border-white/5">
                <div className="flex-1 text-center">
                    <div className="text-xs text-gray-500 font-mono mb-1">BASE</div>
                    <div className="text-sm font-bold text-cyan-400">{baseName || 'main'}</div>
                    <div className="text-xs text-gray-400 mt-1">{baseCommits} commits</div>
                </div>
                <div className="text-gray-600 font-black px-4 animate-pulse">VS</div>
                <div className="flex-1 text-center">
                    <div className="text-xs text-gray-500 font-mono mb-1">COMPARE</div>
                    <div className="text-sm font-bold text-violet-400">{compareName}</div>
                    <div className="text-xs text-gray-400 mt-1">{compareCommits} commits</div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {renderMetric("Commits", commitDelta, <GitCommit size={14} />)}
                {renderMetric("File Churn", churnDelta, <Flame size={14} />, true)}
                {renderMetric("Contributors", contributorDelta, <GitMerge size={14} />)}
                {renderMetric("New Hotspots", hotspotDelta, <Flame size={14} className="text-red-400" />, true)}
            </div>
        </div>
    );
}
