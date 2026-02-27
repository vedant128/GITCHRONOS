'use client';

import React from 'react';
import { Play, Pause } from 'lucide-react';

interface Props {
    isPlaying: boolean;
    togglePlay: () => void;
    speed: number;
    toggleSpeed: () => void;
    progress: number;
    total: number;
    onScrub: (val: number) => void;
}

export default function Controls({ isPlaying, togglePlay, speed, toggleSpeed, progress, total, onScrub }: Props) {
    return (
        <div className="flex items-center gap-6 bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-full px-8 py-4 shadow-2xl relative z-40">
            <button
                onClick={togglePlay}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-cyan-500 hover:bg-cyan-400 text-gray-900 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.5)]"
            >
                {isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
            </button>

            <div className="flex-1 flex items-center gap-4 min-w-[300px]">
                <span className="text-xs text-gray-400 font-mono w-12 text-right">{progress}</span>
                <input
                    type="range"
                    min={0}
                    max={total > 0 ? total - 1 : 0}
                    value={progress}
                    onChange={(e) => onScrub(parseInt(e.target.value))}
                    className="flex-1 accent-cyan-400 cursor-pointer h-2 bg-gray-800 rounded-lg appearance-none"
                />
                <span className="text-xs text-gray-400 font-mono w-12">{total}</span>
            </div>

            <button
                onClick={toggleSpeed}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors border border-gray-700"
                title="Playback Speed"
            >
                <span className="text-xs font-bold">{speed}x</span>
            </button>
        </div>
    );
}
