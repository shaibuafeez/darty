"use client";

import { motion } from "framer-motion";
import { Trophy, Medal, Award, TrendingUp, Wallet } from "lucide-react";

const LEADERBOARD_DATA = [
    { rank: 1, address: "0x7a...9e21", profit: "+428%", volume: "1,240 0G", winRate: "82%" },
    { rank: 2, address: "0x3b...a1b4", profit: "+312%", volume: "980 0G", winRate: "75%" },
    { rank: 3, address: "0x9c...f4d2", profit: "+285%", volume: "850 0G", winRate: "71%" },
    { rank: 4, address: "0x1d...8e9f", profit: "+210%", volume: "720 0G", winRate: "68%" },
    { rank: 5, address: "0x5e...2c3a", profit: "+195%", volume: "650 0G", winRate: "65%" },
    { rank: 6, address: "0x8f...6b7c", profit: "+178%", volume: "580 0G", winRate: "62%" },
    { rank: 7, address: "0x2a...4d5e", profit: "+150%", volume: "510 0G", winRate: "60%" },
    { rank: 8, address: "0x4b...9a1f", profit: "+135%", volume: "450 0G", winRate: "58%" },
    { rank: 9, address: "0x6c...1e2d", profit: "+120%", volume: "400 0G", winRate: "55%" },
    { rank: 10, address: "0x0d...5f8b", profit: "+95%", volume: "350 0G", winRate: "52%" },
];

export default function LeaderboardSection() {
    return (
        <section id="leaderboard" className="py-24 bg-[var(--color-zg-black)] relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[var(--color-zg-purple)]/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
                        TOP <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-zg-purple)] to-white">TRADERS</span>
                    </h2>
                    <p className="text-gray-400 max-w-xl mx-auto font-mono text-sm">
                        Elite forecasters executing high-volume strategies on the Zero Gravity Network.
                    </p>
                </div>

                {/* The Holographic Podium (Top 3) */}
                <div className="flex flex-col md:flex-row justify-center items-end gap-4 md:gap-8 mb-20 px-4">
                    {/* 2nd Place */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="order-2 md:order-1 relative flex-1 max-w-[280px]"
                    >
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="mb-4 relative">
                                <div className="w-20 h-20 rounded-full bg-gray-900 border-2 border-slate-400 flex items-center justify-center shadow-[0_0_20px_rgba(148,163,184,0.3)]">
                                    <Medal className="w-10 h-10 text-slate-400" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-400 text-black font-bold flex items-center justify-center border-2 border-black">2</div>
                            </div>
                            <div className="text-lg font-mono text-white mb-1">{LEADERBOARD_DATA[1].address}</div>
                            <div className="text-sm text-slate-400 mb-4">{LEADERBOARD_DATA[1].volume} Vol</div>

                            {/* Pedestal */}
                            <div className="w-full h-32 bg-gradient-to-t from-slate-900/80 to-slate-800/20 border-t border-slate-500/30 rounded-t-2xl backdrop-blur-sm flex items-end justify-center pb-4 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-slate-400/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="text-2xl font-bold text-slate-400">{LEADERBOARD_DATA[1].profit}</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* 1st Place (Winner) */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="order-1 md:order-2 relative flex-1 max-w-[320px] z-20"
                    >
                        {/* Crown Icon or similar */}
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 animate-bounce">
                            <Trophy className="w-12 h-12 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                        </div>

                        <div className="relative z-10 flex flex-col items-center">
                            <div className="mb-6 relative">
                                <div className="w-24 h-24 rounded-full bg-gray-900 border-2 border-yellow-400 flex items-center justify-center shadow-[0_0_30px_rgba(250,204,21,0.4)]">
                                    <Award className="w-12 h-12 text-yellow-400" />
                                </div>
                                <div className="absolute -bottom-3 -right-3 w-10 h-10 rounded-full bg-yellow-400 text-black font-black text-lg flex items-center justify-center border-4 border-black">1</div>
                            </div>
                            <div className="text-xl font-mono text-white mb-1 font-bold">{LEADERBOARD_DATA[0].address}</div>
                            <div className="text-sm text-yellow-400/80 mb-6">{LEADERBOARD_DATA[0].volume} Vol</div>

                            {/* Pedestal */}
                            <div className="w-full h-48 bg-gradient-to-t from-[var(--color-zg-purple)]/20 to-[var(--color-zg-purple)]/5 border-t border-yellow-400/50 rounded-t-2xl backdrop-blur-md flex items-end justify-center pb-6 relative overflow-hidden shadow-[0_-10px_40px_rgba(250,204,21,0.1)] group">
                                <div className="absolute inset-0 bg-yellow-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="text-4xl font-black text-yellow-400 tracking-tighter">{LEADERBOARD_DATA[0].profit}</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* 3rd Place */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="order-3 relative flex-1 max-w-[280px]"
                    >
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="mb-4 relative">
                                <div className="w-20 h-20 rounded-full bg-gray-900 border-2 border-orange-700 flex items-center justify-center shadow-[0_0_20px_rgba(194,65,12,0.3)]">
                                    <Medal className="w-10 h-10 text-orange-700" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-orange-700 text-white font-bold flex items-center justify-center border-2 border-black">3</div>
                            </div>
                            <div className="text-lg font-mono text-white mb-1">{LEADERBOARD_DATA[2].address}</div>
                            <div className="text-sm text-orange-700 mb-4">{LEADERBOARD_DATA[2].volume} Vol</div>

                            {/* Pedestal */}
                            <div className="w-full h-24 bg-gradient-to-t from-orange-900/40 to-orange-800/10 border-t border-orange-700/30 rounded-t-2xl backdrop-blur-sm flex items-end justify-center pb-4 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-orange-700/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="text-2xl font-bold text-orange-600">{LEADERBOARD_DATA[2].profit}</div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* The Terminal List (4-10) */}
                <div className="max-w-4xl mx-auto bg-black/40 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
                    {/* Header */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-white/5 border-b border-white/10 text-xs font-mono uppercase text-gray-400 tracking-wider">
                        <div className="col-span-2 md:col-span-1 text-center">Rank</div>
                        <div className="col-span-5 md:col-span-5">Trader</div>
                        <div className="col-span-3 md:col-span-2 text-right">Win Rate</div>
                        <div className="col-span-2 md:col-span-2 text-right hidden md:block">Volume</div>
                        <div className="col-span-2 md:col-span-2 text-right">Profit</div>
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-white/5">
                        {LEADERBOARD_DATA.slice(3).map((item, index) => (
                            <motion.div
                                key={item.rank}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors items-center group"
                            >
                                <div className="col-span-2 md:col-span-1 text-center font-mono text-gray-500 group-hover:text-white">#{item.rank}</div>
                                <div className="col-span-5 md:col-span-5 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                                        <Wallet className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <span className="font-mono text-sm text-gray-300">{item.address}</span>
                                </div>
                                <div className="col-span-3 md:col-span-2 text-right font-mono text-gray-400">{item.winRate}</div>
                                <div className="col-span-2 md:col-span-2 text-right hidden md:block font-mono text-gray-400">{item.volume}</div>
                                <div className="col-span-2 md:col-span-2 text-right font-mono font-bold text-[var(--color-zg-purple)] flex items-center justify-end gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    {item.profit}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
