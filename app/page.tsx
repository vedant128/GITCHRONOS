'use client';

import React, { useState, useEffect, useRef } from 'react';
import Timeline from '@/components/Timeline';
import Heatmap from '@/components/Heatmap';
import ContributorGraph from '@/components/ContributorGraph';
import InsightsPanel from '@/components/InsightsPanel';
import Controls from '@/components/Controls';
import HealthScoreGauge from '@/components/HealthScoreGauge';
import BusFactorBadge from '@/components/BusFactorBadge';
import ProductivityDashboard from '@/components/ProductivityDashboard';
import SentimentChart from '@/components/SentimentChart';
import BranchComparison from '@/components/BranchComparison';

import {
    CommitData, Hotspot, ContributorGraphData, AIInsight,
    BusFactorResult, MergeRiskResult, HealthScoreResult,
    ProductivityResult, CommitSentimentResult, BranchComparisonResult
} from '@/lib/types';
import { Search, Loader2, GitBranch } from 'lucide-react';

export default function Home() {
    const [repoUrl, setRepoUrl] = useState('');
    const [branch, setBranch] = useState('');
    const [compareBranch, setCompareBranch] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [commits, setCommits] = useState<CommitData[]>([]);
    const [hotspots, setHotspots] = useState<Hotspot[]>([]);
    const [graphData, setGraphData] = useState<ContributorGraphData | null>(null);

    const [busFactorData, setBusFactorData] = useState<BusFactorResult | null>(null);
    const [mergeRisks, setMergeRisks] = useState<MergeRiskResult[]>([]);
    const [healthScore, setHealthScore] = useState<HealthScoreResult | null>(null);
    const [productivity, setProductivity] = useState<ProductivityResult | null>(null);
    const [branchComparison, setBranchComparison] = useState<BranchComparisonResult | null>(null);

    const [aiInsights, setAiInsights] = useState<AIInsight | null>(null);
    const [sentimentData, setSentimentData] = useState<CommitSentimentResult | null>(null);
    const [aiLoading, setAiLoading] = useState(false);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1);

    const playRef = useRef<NodeJS.Timeout | null>(null);

    const analyzeRepository = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!repoUrl) return;

        setLoading(true);
        setError('');
        setIsPlaying(false);
        setCommits([]);
        setAiInsights(null);
        setSentimentData(null);
        setBranchComparison(null);
        setCurrentIndex(0);

        try {
            const res = await fetch('/api/parse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ repoUrl, branch, compareBranch })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            // We want oldest commit first to play forward through time
            const timeOrderedCommits = [...data.commits].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            setCommits(timeOrderedCommits);
            setHotspots(data.hotspots);
            setGraphData(data.graphData);
            setBusFactorData(data.busFactorData);
            setMergeRisks(data.mergeRiskData || []);
            setHealthScore(data.healthScoreData);
            setProductivity(data.productivityData);

            if (data.branchComparisonData) {
                setBranchComparison(data.branchComparisonData);
            }

            // Fetch AI Insights + Sentiment
            setAiLoading(true);
            fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hotspots: data.hotspots,
                    graphData: data.graphData,
                    commitsCount: data.commitsCount,
                    commits: data.commits
                })
            })
                .then(res => res.json())
                .then(aiData => {
                    if (aiData.success) {
                        setAiInsights(aiData.insights);
                        setSentimentData(aiData.sentimentData);
                    }
                })
                .catch(console.error)
                .finally(() => setAiLoading(false));

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const togglePlay = () => setIsPlaying(!isPlaying);

    const toggleSpeed = () => {
        setSpeed(s => s === 1 ? 2 : s === 2 ? 4 : 1);
    };

    useEffect(() => {
        if (isPlaying && commits.length > 0) {
            playRef.current = setInterval(() => {
                setCurrentIndex(prev => {
                    if (prev >= commits.length - 1) {
                        setIsPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000 / speed);
        } else if (playRef.current) {
            clearInterval(playRef.current);
        }
        return () => {
            if (playRef.current) clearInterval(playRef.current);
        };
    }, [isPlaying, speed, commits.length]);

    return (
        <main className="min-h-screen relative w-full overflow-hidden bg-black text-white selection:bg-cyan-500/30">
            {/* Background starts */}
            <div className="fixed inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2342&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-screen pointer-events-none" />
            <div className="fixed inset-0 z-0 bg-gradient-to-b from-transparent via-black/80 to-black pointer-events-none" />

            <div className="relative z-10 w-full min-h-screen flex flex-col px-6 py-8 max-w-[1600px] mx-auto overflow-visible">
                {/* Header */}
                <header className="flex-none flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-6 backdrop-blur-sm bg-black/20 p-6 rounded-3xl border border-white/5">
                    <div className="flex flex-col">
                        <h1 className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                            GIT CHRONOS
                        </h1>
                        <p className="text-[10px] text-gray-400 font-mono tracking-[0.3em] uppercase mt-2 text-cyan-500">
                            Enterprise Edition
                        </p>
                    </div>

                    <form onSubmit={analyzeRepository} className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
                        <div className="relative flex-1 group min-w-[300px]">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="https://github.com/facebook/react"
                                className="w-full bg-gray-900/60 border border-gray-700/50 rounded-full py-3 pl-14 pr-6 text-sm outline-none focus:border-cyan-500 focus:bg-gray-900/80 transition-all placeholder:text-gray-600 shadow-inner"
                                value={repoUrl}
                                onChange={e => setRepoUrl(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="relative group w-32">
                                <GitBranch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" size={14} />
                                <input
                                    type="text"
                                    placeholder="main"
                                    className="w-full bg-gray-900/60 border border-gray-700/50 rounded-full py-3 pl-10 pr-4 text-sm outline-none focus:border-cyan-500 focus:bg-gray-900/80 transition-all placeholder:text-gray-600"
                                    value={branch}
                                    onChange={e => setBranch(e.target.value)}
                                    title="Base Branch"
                                />
                            </div>
                            <div className="relative group w-32">
                                <GitBranch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-violet-400 transition-colors" size={14} />
                                <input
                                    type="text"
                                    placeholder="feat/x"
                                    className="w-full bg-gray-900/60 border border-gray-700/50 rounded-full py-3 pl-10 pr-4 text-sm outline-none focus:border-violet-500 focus:bg-gray-900/80 transition-all placeholder:text-gray-600"
                                    value={compareBranch}
                                    onChange={e => setCompareBranch(e.target.value)}
                                    title="Compare Branch"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-8 py-3 rounded-full transition-all disabled:opacity-50 flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:scale-105 active:scale-95 whitespace-nowrap"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : 'ANALYZE'}
                        </button>
                    </form>
                </header>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 text-sm backdrop-blur-md font-mono flex items-center gap-3 shadow-lg">
                        <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                        {error}
                    </div>
                )}

                {commits.length === 0 && !loading && !error && (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-6">
                        <div className="w-24 h-24 rounded-full border border-gray-800 flex items-center justify-center bg-gray-900/40 shadow-xl">
                            <Search size={32} className="opacity-50 text-cyan-500" />
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-light text-gray-400">Enter a public <span className="text-white font-medium">GitHub</span> url.</p>
                            <p className="text-sm text-gray-600 mt-2 font-mono">Parsing branch diffs • Risk factors • Team velocity</p>
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-8">
                        <div className="relative w-32 h-32">
                            <div className="absolute inset-0 rounded-full border-t-2 border-cyan-500 animate-[spin_1s_linear_infinite]" />
                            <div className="absolute inset-4 rounded-full border-r-2 border-violet-500 animate-[spin_1.5s_linear_infinite]" />
                            <div className="absolute inset-8 rounded-full border-b-2 border-cyan-200 animate-[spin_2s_linear_infinite]" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-3">
                            <p className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">
                                PROCESSING INTELLIGENCE
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-500 font-mono">
                                <Loader2 size={14} className="animate-spin" />
                                Synchronizing multidimensional git models...
                            </div>
                        </div>
                    </div>
                )}

                {commits.length > 0 && !loading && (
                    <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col w-full gap-8 mt-2 pb-20 px-2 min-h-0">
                        {/* Row 1: Timeline (Full) */}
                        <div className="flex flex-col gap-6 relative">
                            <Timeline commits={commits} currentIndex={currentIndex} />
                            <div className="flex justify-center -mt-8">
                                <Controls
                                    isPlaying={isPlaying}
                                    togglePlay={togglePlay}
                                    speed={speed}
                                    toggleSpeed={toggleSpeed}
                                    progress={currentIndex}
                                    total={commits.length}
                                    onScrub={setCurrentIndex}
                                />
                            </div>
                        </div>

                        {/* Row 2: Analytics High-Level KPIs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                            <div className="col-span-1 border border-white/5 rounded-2xl">
                                {healthScore && <HealthScoreGauge healthData={healthScore} />}
                            </div>
                            <div className="col-span-1 border border-white/5 rounded-2xl">
                                {busFactorData && <BusFactorBadge busFactorData={busFactorData} />}
                            </div>
                            <div className="col-span-1 border border-white/5 rounded-2xl">
                                {aiLoading ? (
                                    <div className="w-full h-[300px] flex items-center justify-center bg-gray-900/40 border border-gray-800 rounded-2xl backdrop-blur-md">
                                        <Loader2 className="animate-spin text-cyan-500" />
                                    </div>
                                ) : (
                                    sentimentData && <SentimentChart sentimentData={sentimentData} />
                                )}
                            </div>
                            <div className="col-span-1 border border-white/5 rounded-2xl">
                                {branchComparison ? (
                                    <BranchComparison branchData={branchComparison} baseName={branch || 'main'} compareName={compareBranch} />
                                ) : (
                                    <InsightsPanel insights={aiInsights} loading={aiLoading} />
                                )}
                            </div>
                        </div>

                        {/* Row 3: Productivity (Full width) */}
                        {productivity && (
                            <div className="w-full">
                                <ProductivityDashboard data={productivity} />
                            </div>
                        )}

                        {/* Row 4: Deep Dive Details (Graph & Heatmap) */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-full">
                            <div className="col-span-1 w-full relative">
                                {graphData && <ContributorGraph data={graphData} />}
                            </div>
                            <div className="col-span-1 w-full relative">
                                {hotspots.length > 0 && <Heatmap commits={commits} hotspots={hotspots} mergeRisks={mergeRisks} />}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
