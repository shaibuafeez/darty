"use client";

import { motion } from "framer-motion";
import { ethers } from "ethers";
import { useState } from "react";
import { Market, MarketStatus, Outcome } from "@/lib/contracts/predictionMarket";
import { Activity, BarChart3, Clock, Terminal, Zap } from "lucide-react";

interface MarketsSectionProps {
    markets: Market[];
    loading: boolean;
}

const formatAmount = (amount: bigint) => {
    return ethers.formatEther(amount) + " 0G";
};

const calculateOdds = (market: Market) => {
    const totalPool = market.totalPoolA + market.totalPoolB;
    if (totalPool === 0n) {
        return { oddsA: 50, oddsB: 50 };
    }
    const oddsA = Number((market.totalPoolA * 10000n) / totalPool) / 100;
    const oddsB = Number((market.totalPoolB * 10000n) / totalPool) / 100;
    return { oddsA, oddsB };
};

export default function MarketsSection({ markets, loading }: MarketsSectionProps) {
    const [activeFilter, setActiveFilter] = useState("All");
    const filters = ["All", "Crypto", "Politics", "Sports"];

    const filteredMarkets = activeFilter === "All"
        ? markets
        : markets.filter(m => m.category === activeFilter);

    return (
        <section id="markets" className="py-24 bg-[var(--color-zg-black)] relative overflow-hidden">
            {/* Background Grid */}
            <div
                className="absolute inset-0 opacity-[0.02] pointer-events-none"
                style={{
                    backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
                    backgroundSize: "40px 40px"
                }}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-[var(--color-zg-purple)]">
                            <Terminal className="w-4 h-4" />
                            <span className="text-xs font-mono tracking-widest uppercase">/ Market_Feed_v2.0</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-white">
                            Active <span className="font-serif italic text-gray-500">Scanning</span>
                        </h2>
                    </div>

                    {/* Filters - System Tabs */}
                    <div className="flex flex-wrap gap-2">
                        {filters.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`group relative px-6 py-2 text-xs font-mono uppercase tracking-wider transition-all duration-300 ${activeFilter === filter
                                    ? "text-black bg-[var(--color-zg-purple)] font-bold clip-path-polygon-[10px_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%,0_10px]"
                                    : "text-gray-400 border border-white/10 hover:border-[var(--color-zg-purple)] hover:text-[var(--color-zg-purple)]"
                                    }`}
                                style={{
                                    clipPath: activeFilter === filter ? "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" : "none"
                                }}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-[300px] border border-white/5 bg-white/[0.02] animate-pulse rounded-sm relative">
                                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20" />
                                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20" />
                                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20" />
                                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20" />
                            </div>
                        ))}
                    </div>
                ) : filteredMarkets.length === 0 ? (
                    <div className="py-32 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-lg">
                        <Activity className="w-12 h-12 text-gray-600 mb-4 opacity-50" />
                        <h3 className="text-xl font-mono text-gray-500">NO_SIGNAL_FOUND</h3>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredMarkets.map((market, i) => {
                            const odds = calculateOdds(market);
                            return (
                                <motion.div
                                    key={market.marketId.toString()}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="group relative bg-black border border-white/10 hover:border-[var(--color-zg-purple)]/50 transition-colors duration-300 isolate"
                                >
                                    {/* Scanline Effect */}
                                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,19,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_2px,3px_100%] opacity-20" />

                                    {/* Corner Accents */}
                                    <div className="absolute -top-[1px] -left-[1px] w-4 h-4 border-t border-l border-[var(--color-zg-purple)] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute -top-[1px] -right-[1px] w-4 h-4 border-t border-r border-[var(--color-zg-purple)] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute -bottom-[1px] -left-[1px] w-4 h-4 border-b border-l border-[var(--color-zg-purple)] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute -bottom-[1px] -right-[1px] w-4 h-4 border-b border-r border-[var(--color-zg-purple)] opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="relative z-10 p-6 flex flex-col h-full">
                                        {/* Header */}
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 bg-[var(--color-zg-purple)] rounded-full animate-pulse" />
                                                <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500">
                                                    ID_{market.marketId.toString().padStart(4, '0')}
                                                </span>
                                            </div>
                                            <span className="px-2 py-1 bg-white/5 border border-white/10 text-[10px] font-mono text-gray-400 uppercase">
                                                {market.category}
                                            </span>
                                        </div>

                                        {/* Question */}
                                        <h3 className="text-xl font-medium text-white mb-8 leading-snug min-h-[3.5rem] group-hover:text-[var(--color-zg-purple)] transition-colors">
                                            {market.question}
                                        </h3>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-2 gap-4 mb-8">
                                            <div className="space-y-1">
                                                <div className="text-[10px] uppercase text-gray-500 font-mono">Volume</div>
                                                <div className="text-sm font-mono text-white flex items-center gap-2">
                                                    <BarChart3 className="w-3 h-3 text-gray-600" />
                                                    {formatAmount(market.totalPoolA + market.totalPoolB)}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-[10px] uppercase text-gray-500 font-mono">End Date</div>
                                                <div className="text-sm font-mono text-white flex items-center gap-2">
                                                    <Clock className="w-3 h-3 text-gray-600" />
                                                    {new Date(Number(market.resolutionTime) * 1000).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Probability Bars (Holographic Style) */}
                                        <div className="mt-auto space-y-3">
                                            {/* Option A */}
                                            <div className="relative group/bar cursor-pointer">
                                                <div className="flex justify-between text-xs font-mono mb-1">
                                                    <span className="text-gray-400">{market.outcomeA}</span>
                                                    <span className="text-[var(--color-zg-purple)]">{odds.oddsA.toFixed(1)}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-white/10 overflow-hidden">
                                                    <div
                                                        style={{ width: `${odds.oddsA}%` }}
                                                        className="h-full bg-[var(--color-zg-purple)] group-hover/bar:bg-white transition-colors duration-300"
                                                    />
                                                </div>
                                            </div>

                                            {/* Option B */}
                                            <div className="relative group/bar cursor-pointer">
                                                <div className="flex justify-between text-xs font-mono mb-1">
                                                    <span className="text-gray-400">{market.outcomeB}</span>
                                                    <span className="text-gray-500">{odds.oddsB.toFixed(1)}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-white/10 overflow-hidden">
                                                    <div
                                                        style={{ width: `${odds.oddsB}%` }}
                                                        className="h-full bg-gray-600 group-hover/bar:bg-gray-400 transition-colors duration-300"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action */}
                                        <a href={`/market/${market.marketId}`} className="block mt-6 text-center py-3 border border-white/20 text-xs font-mono uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all">
                                            Execute Trade
                                        </a>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}
