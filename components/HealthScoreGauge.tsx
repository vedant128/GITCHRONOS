import React from 'react';
import { HealthScoreResult } from '@/lib/types';

interface Props {
    healthData: HealthScoreResult;
}

export default function HealthScoreGauge({ healthData }: Props) {
    const { healthScore, grade, summary } = healthData;

    // Determine colors based on grade
    let color = 'text-green-400';
    let strokeColor = '#4ade80';
    if (grade === 'B') { color = 'text-blue-400'; strokeColor = '#60a5fa'; }
    if (grade === 'C') { color = 'text-orange-400'; strokeColor = '#fb923c'; }
    if (grade === 'D') { color = 'text-red-500'; strokeColor = '#ef4444'; }

    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (healthScore / 100) * circumference;

    return (
        <div className="w-full rounded-2xl bg-gray-900/40 backdrop-blur-md border border-gray-800 p-6 flex flex-col items-center justify-center relative overflow-hidden group hover:border-gray-700 transition-colors h-full min-h-[300px]">
            <h3 className="text-gray-300 text-sm tracking-widest uppercase font-semibold absolute top-4 left-4 z-10">Project Health</h3>

            <div className="relative flex items-center justify-center mt-6">
                {/* Background Circle */}
                <svg className="transform -rotate-90 w-32 h-32">
                    <circle
                        cx="64"
                        cy="64"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-800"
                    />
                    {/* Progress Circle */}
                    <circle
                        cx="64"
                        cy="64"
                        r={radius}
                        stroke={strokeColor}
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-1000 ease-out"
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className={`text-3xl font-black ${color}`}>{grade}</span>
                    <span className="text-xs font-mono text-gray-400 mt-1">{healthScore}/100</span>
                </div>
            </div>

            <p className="mt-6 text-sm text-gray-400 text-center leading-relaxed px-4 break-words">
                {summary}
            </p>
        </div>
    );
}
