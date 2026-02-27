'use client';

import React, { useMemo } from 'react';
import { CommitData, Hotspot, MergeRiskResult } from '@/lib/types';
import * as d3 from 'd3';
import { AlertTriangle } from 'lucide-react';

interface HeatmapProps {
    commits: CommitData[];
    hotspots: Hotspot[];
    mergeRisks?: MergeRiskResult[];
}

export default function Heatmap({ commits, hotspots, mergeRisks = [] }: HeatmapProps) {
    const topFiles = hotspots.slice(0, 15).map(h => h.fileName);

    const heatmapData = useMemo(() => {
        if (!commits.length || !topFiles.length) return { matrix: [], maxVal: 0, buckets: 0 };

        // Sort oldest first
        const sortedCom = [...commits].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const BUCKETS = 30;
        const start = new Date(sortedCom[0].date).getTime();
        const end = new Date(sortedCom[sortedCom.length - 1].date).getTime();
        const range = end - start || 1;
        const bucketSize = range / BUCKETS;

        const matrix: number[][] = Array.from({ length: topFiles.length }, () => Array(BUCKETS).fill(0));
        let maxVal = 0;

        sortedCom.forEach(commit => {
            const cTime = new Date(commit.date).getTime();
            let bIdx = Math.floor((cTime - start) / bucketSize);
            if (bIdx >= BUCKETS) bIdx = BUCKETS - 1;

            commit.filesChanged.forEach((fc: any) => {
                const fileIdx = topFiles.indexOf(fc.fileName);
                if (fileIdx !== -1) {
                    matrix[fileIdx][bIdx] += fc.changes;
                    if (matrix[fileIdx][bIdx] > maxVal) maxVal = matrix[fileIdx][bIdx];
                }
            });
        });

        return { matrix, maxVal, buckets: BUCKETS };
    }, [commits, topFiles]);

    if (!topFiles.length) return null;

    const colorScale = d3.scaleSequential(d3.interpolateInferno).domain([0, heatmapData.maxVal || 1]);

    return (
        <div className="w-full rounded-2xl bg-gray-900/40 backdrop-blur-md border border-gray-800 p-4 h-[400px] overflow-y-auto custom-scrollbar relative">
            <h3 className="text-gray-300 text-sm tracking-widest uppercase font-semibold mb-4 z-10 sticky top-0 bg-transparent p-1">File Churn Heatmap (Top 15 Hotspots)</h3>
            <div className="flex flex-col gap-2 w-full min-w-[600px] mt-2">
                {topFiles.map((file, fileIdx) => (
                    <div key={file} className="flex items-center gap-2 group relative">
                        {mergeRisks.find(r => r.file === file) && (
                            <div title="Merge Conflict Risk Detected" className="absolute -left-4">
                                <AlertTriangle size={12} className="text-orange-500" />
                            </div>
                        )}
                        <div className="w-56 truncate text-xs text-gray-400 group-hover:text-cyan-400 transition-colors font-mono" title={file}>
                            {file.split('/').slice(-2).join('/') || file}
                        </div>
                        <div className="flex-1 flex gap-[2px]">
                            {heatmapData.matrix[fileIdx].map((val, bIdx) => {
                                const isZero = val === 0;
                                return (
                                    <div
                                        key={bIdx}
                                        className="flex-1 h-5 rounded-sm transition-all hover:scale-y-125 cursor-pointer"
                                        style={{
                                            backgroundColor: isZero ? '#1f2937' : colorScale(val),
                                            opacity: isZero ? 0.3 : 1
                                        }}
                                        title={`Bin ${bIdx + 1}: ${val} changes`}
                                    />
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
