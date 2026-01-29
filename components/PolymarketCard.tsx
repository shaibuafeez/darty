"use client";

import { motion } from "framer-motion";
import { ExternalLink, TrendingUp, Copy } from "lucide-react";
import { useRouter } from "next/navigation";

export interface PolymarketData {
  id: string;
  question: string;
  description: string;
  endDate: string;
  category: string;
  volume: number;
  liquidity: number;
  image: string;
  icon: string;
  outcomePrices: [string, string]; // [YES price, NO price]
  outcomes: [string, string]; // ["Yes", "No"]
  slug: string;
  volume24hr?: number;
  hasLivePrice?: boolean;
}

interface PolymarketCardProps {
  market: PolymarketData;
}

export default function PolymarketCard({ market }: PolymarketCardProps) {
  const router = useRouter();

  // Calculate probability from price (0-1 range to percentage)
  const yesProb = (parseFloat(market.outcomePrices[0]) * 100).toFixed(0);
  const noProb = (parseFloat(market.outcomePrices[1]) * 100).toFixed(0);

  // Format volume
  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return `$${(vol / 1000000).toFixed(1)}M`;
    if (vol >= 1000) return `$${(vol / 1000).toFixed(0)}K`;
    return `$${vol.toFixed(0)}`;
  };

  const handleCloneTo0G = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Store market data in sessionStorage to pre-fill create form
    sessionStorage.setItem(
      "cloneMarket",
      JSON.stringify({
        question: market.question,
        category: market.category,
        endDate: new Date(market.endDate).toISOString().split("T")[0],
      })
    );
    router.push("/create");
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group cursor-pointer h-full min-h-[340px] flex flex-col"
      onClick={() => window.open(`https://polymarket.com/event/${market.slug}`, "_blank")}
    >
      {/* Card Background */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm border border-white/10 group-hover:border-purple-500/50 transition-all duration-500 rounded-xl shadow-2xl group-hover:shadow-[0_0_40px_rgba(168,85,247,0.15)]" />

      {/* Decorative Blur */}
      <div className="absolute -inset-4 bg-purple-500/5 blur-[40px] -z-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Content */}
      <div className="relative p-6 flex flex-col h-full z-10">
        {/* Header: Category & Live Status */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-2">
            <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-md flex items-center gap-1">
              <ExternalLink className="w-3 h-3" />
              Polymarket
            </span>
            {market.hasLivePrice && (
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-green-400 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-40"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400"></span>
                </span>
                Live
              </div>
            )}
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white leading-tight group-hover:text-purple-400 transition-colors duration-300 line-clamp-2">
            {market.question}
          </h3>
          <p className="text-gray-400 text-xs font-mono mt-2 flex items-center gap-2">
            <TrendingUp className="w-3 h-3" /> Vol: {formatVolume(market.volume)}
          </p>
        </div>

        {/* Action Area: YES/NO Bar + Clone Overlay */}
        <div className="mt-auto relative h-14 bg-black/40 rounded-xl p-1.5 flex gap-1 border border-white/5 group/action">
          {/* YES Button (Green) */}
          <div className="flex-1 rounded-lg bg-green-500/10 border border-green-500/10 relative overflow-hidden flex items-center justify-between px-3">
            <div
              className="absolute inset-y-0 left-0 bg-green-500/10"
              style={{ width: `${yesProb}%` }}
            />
            <span className="relative z-10 text-[10px] font-bold uppercase tracking-wider text-green-400">
              Yes
            </span>
            <span className="relative z-10 text-sm font-mono font-bold text-white">
              {yesProb}%
            </span>
          </div>

          {/* NO Button (Red) */}
          <div className="flex-1 rounded-lg bg-red-500/10 border border-red-500/10 relative overflow-hidden flex items-center justify-between px-3">
            <div
              className="absolute inset-y-0 left-0 bg-red-500/10"
              style={{ width: `${noProb}%` }}
            />
            <span className="relative z-10 text-[10px] font-bold uppercase tracking-wider text-red-400">
              No
            </span>
            <span className="relative z-10 text-sm font-mono font-bold text-white">{noProb}%</span>
          </div>

          {/* Clone Overlay Button (Visible on Hover) */}
          <button
            onClick={handleCloneTo0G}
            className="absolute inset-1 bg-purple-600 hover:bg-purple-700 text-white font-bold uppercase tracking-widest text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] shadow-xl z-20"
          >
            <Copy className="w-4 h-4" />
            Clone to 0G
          </button>
        </div>
      </div>
    </motion.div>
  );
}
