"use client";

import { motion } from "framer-motion";
import { ethers } from "ethers";
import { useState } from "react";
import { Market, MarketStatus, Outcome } from "@/lib/contracts/predictionMarket";

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
        <section id="markets" className="py-24 bg-[var(--color-zg-black)] relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-4xl font-black text-white tracking-tighter mb-2">
                            LIVE <span className="text-[var(--color-zg-purple)]">MARKETS</span>
                        </h2>
                        <p className="text-gray-400">Trade on real-world events.</p>
                    </div>
                    <div className="flex gap-2 bg-[rgba(255,255,255,0.03)] p-1 rounded-full border border-[rgba(255,255,255,0.05)]">
                        {filters.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-6 py-2 rounded-full text-xs font-bold uppercase transition-all duration-300 ${activeFilter === filter
                                    ? "bg-[var(--color-zg-purple)] text-black shadow-[0_0_20px_rgba(212,173,255,0.3)] scale-105"
                                    : "text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 rounded-2xl bg-[rgba(255,255,255,0.03)] animate-pulse border border-[rgba(255,255,255,0.05)]" />
                        ))}
                    </div>
                ) : filteredMarkets.length === 0 ? (
                    <div className="text-center py-24 glass-panel rounded-2xl border-dashed border border-white/10">
                        <div className="text-6xl mb-4 grayscale opacity-50">🔮</div>
                        <h3 className="text-xl font-bold text-white mb-2">No active markets</h3>
                        <p className="text-gray-400 mb-6">The future is unwritten.</p>
                        <a href="/create" className="px-6 py-3 bg-[var(--color-zg-purple)] text-black font-bold rounded-lg hover:bg-white transition-colors">
                            Create Market
                        </a>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMarkets.map((market, i) => {
                            const odds = calculateOdds(market);
                            return (
                                <motion.div
                                    key={market.marketId.toString()}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05 }}
                                    className="group relative bg-[var(--color-zg-black)] rounded-2xl border border-[rgba(255,255,255,0.08)] hover:border-[var(--color-zg-purple)] overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(172,93,255,0.15)]"
                                >
                                    {/* Image Placeholder / Gradient */}
                                    <div className="h-32 bg-gradient-to-br from-gray-900 to-black relative p-6 flex items-center justify-center overflow-hidden">
                                        <div className="absolute inset-0 bg-[var(--color-zg-purple)]/5 group-hover:bg-[var(--color-zg-purple)]/10 transition-colors" />
                                        <h3 className="relative z-10 text-xl font-bold text-white text-center leading-tight">
                                            {market.question}
                                        </h3>
                                    </div>

                                    <div className="p-6">
                                        <div className="flex justify-between text-xs text-gray-500 mb-4 uppercase tracking-wider font-medium">
                                            <span>{market.category}</span>
                                            <span>Vol: {formatAmount(market.totalPoolA + market.totalPoolB)}</span>
                                        </div>

                                        {/* Bars */}
                                        <div className="space-y-3 mb-6">
                                            <div className="relative h-10 bg-[rgba(255,255,255,0.03)] rounded-lg overflow-hidden flex items-center px-3 cursor-pointer hover:bg-[rgba(255,255,255,0.05)] transition-colors group/bar">
                                                <div
                                                    className="absolute inset-y-0 left-0 bg-[#22c55e]/20 group-hover/bar:bg-[#22c55e]/30 transition-all"
                                                    style={{ width: `${odds.oddsA}%` }}
                                                />
                                                <div className="relative z-10 flex justify-between w-full text-sm">
                                                    <span className="font-medium text-gray-300">{market.outcomeA}</span>
                                                    <span className="font-bold text-[#22c55e]">{odds.oddsA.toFixed(1)}%</span>
                                                </div>
                                            </div>

                                            <div className="relative h-10 bg-[rgba(255,255,255,0.03)] rounded-lg overflow-hidden flex items-center px-3 cursor-pointer hover:bg-[rgba(255,255,255,0.05)] transition-colors group/bar">
                                                <div
                                                    className="absolute inset-y-0 left-0 bg-[#ef4444]/20 group-hover/bar:bg-[#ef4444]/30 transition-all"
                                                    style={{ width: `${odds.oddsB}%` }}
                                                />
                                                <div className="relative z-10 flex justify-between w-full text-sm">
                                                    <span className="font-medium text-gray-300">{market.outcomeB}</span>
                                                    <span className="font-bold text-[#ef4444]">{odds.oddsB.toFixed(1)}%</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                            <div className="flex -space-x-2">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="w-6 h-6 rounded-full bg-gray-800 border-2 border-black" />
                                                ))}
                                            </div>
                                            <a href={`/market/${market.marketId}`} className="text-xs font-bold uppercase text-[var(--color-zg-purple)] hover:text-white transition-colors">
                                                Trade Now &rarr;
                                            </a>
                                        </div>
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
