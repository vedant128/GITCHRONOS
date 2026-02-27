'use client';

import React from 'react';
import { CommitData } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    commits: CommitData[];
    currentIndex: number;
}

export default function Timeline({ commits, currentIndex }: Props) {
    const visibleCommits = commits.slice(Math.max(0, currentIndex - 4), currentIndex + 1).reverse();

    return (
        <div className="w-full relative h-[360px] flex items-center justify-center overflow-hidden">
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gray-800 rounded-full overflow-hidden">
                <div
                    className="h-full bg-cyan-500 shadow-[0_0_10px_#06b6d4] transition-all duration-300"
                    style={{ width: commits.length > 0 ? `${(currentIndex / (commits.length - 1)) * 100}%` : '0%' }}
                />
            </div>

            <div className="w-full max-w-5xl flex justify-center items-center relative z-10 h-full">
                <AnimatePresence>
                    {visibleCommits.map((commit, i) => {
                        const isLatest = i === 0;
                        return (
                            <motion.div
                                key={commit.hash}
                                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                                animate={{
                                    opacity: isLatest ? 1 : Math.max(0, 0.6 - (i * 0.15)),
                                    y: isLatest ? -20 : 0,
                                    scale: isLatest ? 1.05 : 0.9 - (i * 0.05),
                                    x: isLatest ? 0 : -(i * 220)
                                }}
                                exit={{ opacity: 0, scale: 0.5, x: 200 }}
                                transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
                                className={`absolute p-5 rounded-2xl border backdrop-blur-xl w-80 flex flex-col gap-3 shadow-2xl ${isLatest
                                    ? 'bg-gray-800/95 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.4)] z-30'
                                    : 'bg-gray-900/40 border-gray-700 z-10'
                                    }`}
                                style={{
                                    marginLeft: isLatest ? 0 : `-${i * 20}px`
                                }}
                            >
                                <div className="flex justify-between items-center text-xs text-gray-400 font-mono">
                                    <span className="text-cyan-400 font-bold">{commit.hash.substring(0, 7)}</span>
                                    <span className="opacity-70">{new Date(commit.date).toLocaleDateString()}</span>
                                </div>
                                <p className={`font-semibold text-sm line-clamp-3 leading-snug ${isLatest ? 'text-gray-100' : 'text-gray-400'}`}>
                                    {commit.message}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-white shadow-inner">
                                        {commit.author_name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-xs text-gray-300 truncate max-w-[180px]">{commit.author_name}</span>
                                </div>

                                {isLatest && (
                                    <div className="mt-2 pt-3 border-t border-gray-700/50 flex gap-4 text-xs font-mono">
                                        <span className="text-green-400">+{commit.filesChanged.reduce((acc: number, f: any) => acc + f.insertions, 0)} ins</span>
                                        <span className="text-red-400">-{commit.filesChanged.reduce((acc: number, f: any) => acc + f.deletions, 0)} del</span>
                                        <span className="text-blue-400">{commit.filesChanged.length} files</span>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}
