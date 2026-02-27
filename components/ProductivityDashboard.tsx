import React from 'react';
import { ProductivityResult } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, Calendar } from 'lucide-react';

interface Props {
    data: ProductivityResult;
}

export default function ProductivityDashboard({ data }: Props) {
    const { commitsPerHour, weekendActivityPercentage } = data;

    return (
        <div className="w-full rounded-2xl bg-gray-900/40 backdrop-blur-md border border-gray-800 p-6 flex flex-col gap-6 h-full min-h-[300px]">
            <div className="flex justify-between items-center text-gray-300 tracking-widest uppercase font-semibold text-sm">
                <h3>Productivity Patterns</h3>
                <div className="flex gap-4">
                    <span className="flex items-center gap-1 text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md mb-2">
                        <Calendar size={14} /> {weekendActivityPercentage}% Weekend
                    </span>
                </div>
            </div>

            <div className="flex-1 w-full min-h-[220px]">
                <h4 className="flex items-center gap-2 text-xs font-mono text-gray-500 mb-4 uppercase">
                    <Clock size={12} /> Commits by Hour
                </h4>
                <ResponsiveContainer width="100%" height="80%">
                    <BarChart data={commitsPerHour}>
                        <XAxis
                            dataKey="hour"
                            stroke="#4b5563"
                            fontSize={10}
                            tickMargin={10}
                            interval="preserveStartEnd"
                            minTickGap={20}
                        />
                        <YAxis stroke="#4b5563" fontSize={10} width={30} />
                        <Tooltip
                            cursor={{ fill: 'rgba(6,182,212,0.1)' }}
                            contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                        />
                        <Bar
                            dataKey="count"
                            fill="#06b6d4"
                            radius={[4, 4, 0, 0]}
                            animationDuration={1500}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
