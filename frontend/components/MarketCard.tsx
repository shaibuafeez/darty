'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, Users, ArrowUpRight } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { useRouter } from 'next/navigation';
import BetModal from './BetModal';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface Market {
  id: number;
  question: string;
  end_timestamp: number;
  total_yes_shares: number;
  total_no_shares: number;
  total_volume: number;
  resolved: boolean;
  outcome?: boolean;
  winning_side?: 'YES' | 'NO';
  category?: string;
  end_date?: number;
}

interface MarketCardProps {
  market: Market;
}

export default function MarketCard({ market }: MarketCardProps) {
  const router = useRouter();
  const [showBetModal, setShowBetModal] = useState(false);
  const [selectedSide, setSelectedSide] = useState<'YES' | 'NO'>('YES');

  // Calculate odds
  const total = market.total_yes_shares + market.total_no_shares || 1;
  const yesOdds = Math.round((market.total_yes_shares / total) * 100);
  const noOdds = 100 - yesOdds;

  // Time remaining
  const timeRemaining = formatDistance(market.end_timestamp * 1000, Date.now(), {
    addSuffix: true,
  });

  const handleBet = (side: 'YES' | 'NO') => {
    setSelectedSide(side);
    setShowBetModal(true);
  };

  const handleCardClick = () => {
    router.push(`/market/${market.id}`);
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -5 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={handleCardClick}
        className="relative group cursor-pointer h-full min-h-[340px] flex flex-col"
      >
        {/* Card Background - Award Winning Liquid Glass */}
        <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-2xl border border-white/10 group-hover:border-off-blue/50 transition-all duration-500 rounded-2xl shadow-2xl group-hover:shadow-[0_0_40px_rgba(96,165,250,0.15)]" />
        <div className="absolute inset-0 bg-noise opacity-20 mix-blend-overlay rounded-2xl pointer-events-none" />

        {/* Decorative Blur blob behind card */}
        <div className="absolute -inset-4 bg-new-mint/5 blur-[40px] -z-10 rounded-full mix-blend-screen opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Content Container */}
        <div className="relative p-6 flex flex-col h-full z-10">

          {/* Header: Category & Live Status */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex gap-2">
              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-off-blue/10 text-off-blue border border-off-blue/20 rounded-md">
                Crypto
              </span>
              {market.resolved && (
                <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-neutral-800 text-white rounded-md border border-neutral-700">
                  Resolved
                </span>
              )}
            </div>
            {!market.resolved && (
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-off-green bg-off-green/10 px-2 py-1 rounded-full border border-off-green/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-off-green opacity-40"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-off-green"></span>
                </span>
                Live
              </div>
            )}
          </div>

          {/* Question */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white leading-tight group-hover:text-off-blue transition-colors duration-300 line-clamp-2">
              {market.question}
            </h3>
            <p className="text-gray-400 text-xs font-mono mt-2 flex items-center gap-2">
              <Clock className="w-3 h-3" /> Ends in {timeRemaining}
            </p>
          </div>

          {/* Action Area: YES / NO Bars (Hero Style) */}
          <div className="mt-auto space-y-2">

            {market.resolved ? (
              /* Resolved State - Show Winner */
              <div className="w-full p-4 bg-neutral-950 rounded-xl border border-white/10">
                <div className="text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Winner</p>
                  <p className={`text-2xl font-black uppercase ${market.winning_side === 'YES' ? 'text-off-green' : 'text-off-red'}`}>
                    {market.winning_side || (yesOdds > noOdds ? 'YES' : 'NO')}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* YES Button (Green) */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleBet('YES'); }}
                  className="w-full h-12 bg-neutral-950 rounded-xl flex items-center relative overflow-hidden group/yes hover:ring-1 hover:ring-off-green/50 transition-all cursor-pointer border border-white/5"
                >
                  <div className="absolute inset-y-0 left-0 bg-off-green/10 transition-all duration-300 group-hover/yes:bg-off-green/20" style={{ width: `${yesOdds}%` }} />
                  <div className="relative z-10 flex justify-between w-full px-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-off-green">Yes</span>
                    <span className="text-sm font-mono font-bold text-white">{yesOdds}%</span>
                  </div>
                </button>

                {/* NO Button (Red) */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleBet('NO'); }}
                  className="w-full h-12 bg-neutral-950 rounded-xl flex items-center relative overflow-hidden group/no hover:ring-1 hover:ring-off-red/50 transition-all cursor-pointer border border-white/5"
                >
                  <div className="absolute inset-y-0 left-0 bg-off-red/10 transition-all duration-300 group-hover/no:bg-off-red/20" style={{ width: `${noOdds}%` }} />
                  <div className="relative z-10 flex justify-between w-full px-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-off-red">No</span>
                    <span className="text-sm font-mono font-bold text-white">{noOdds}%</span>
                  </div>
                </button>
              </>
            )}

          </div>

        </div>
      </motion.div>

      {/* Bet Modal */}
      {showBetModal && (
        <BetModal
          market={market}
          side={selectedSide}
          onClose={() => setShowBetModal(false)}
        />
      )}
    </>
  );
}
