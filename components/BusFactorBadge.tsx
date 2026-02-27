import React from 'react';
import { BusFactorResult } from '@/lib/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { AlertTriangle } from 'lucide-react';

interface Props {
    busFactorData: BusFactorResult;
}

const COLORS = ['#06b6d4', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6b7280'];

export default function BusFactorBadge({ busFactorData }: Props) {
    const { busFactor, riskLevel, ownershipData, singlePointOfFailureFiles } = busFactorData;

    // Filter top 5 for chart, bundle rest into "Others"
    let chartData = [];
    if (ownershipData.length > 5) {
        chartData = [...ownershipData.slice(0, 5)];
        const otherSum = ownershipData.slice(5).reduce((acc, a) => acc + a.percentage, 0);
        chartData.push({ author: 'Others', percentage: otherSum, fileCount: 0 });
    } else {
        chartData = [...ownershipData];
    }

    return (
        <div className="w-full rounded-2xl bg-gray-900/40 backdrop-blur-md border border-gray-800 p-6 flex flex-col relative h-full min-h-[300px]">
            <div className="flex justify-between items-start mb-4 relative z-10 text-gray-300 tracking-widest uppercase font-semibold text-sm">
                <h3>Bus Factor</h3>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${riskLevel === 'High' ? 'bg-red-500/20 text-red-500 border border-red-500/50' :
                    riskLevel === 'Medium' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50' :
                        'bg-green-500/20 text-green-400 border border-green-500/50'
                    }`}>
                    {riskLevel === 'High' && <AlertTriangle size={14} />}
                    Risk: {riskLevel} (BF: {busFactor})
                </div>
            </div>

            <div className="flex-1 w-full flex items-center justify-center -mt-4 min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="percentage"
                            stroke="none"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <RechartsTooltip
                            // @ts-ignore
                            formatter={(value: any) => {
                                if (typeof value === 'number') return `${value.toFixed(1)}%`;
                                return `${value || 0}%`;
                            }}
                            contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', color: '#9ca3af' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {singlePointOfFailureFiles.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-800">
                    <p className="text-xs text-gray-500 mb-2 font-mono uppercase tracking-widest">Single Points of Failure (Files)</p>
                    <div className="flex flex-col gap-1">
                        {singlePointOfFailureFiles.slice(0, 2).map((file, i) => (
                            <span key={i} className="text-xs text-red-400/80 font-mono line-clamp-1 truncate block" title={file}>
                                {file.split('/').slice(-2).join('/')}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
