'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import MarketCard from '@/components/MarketCard';
import type { Market } from '@/components/MarketCard';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MarketsPage() {
  const router = useRouter();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Crypto' | 'Politics' | 'Sports'>('All');

  useEffect(() => {
    loadMarkets();
  }, []);

  const loadMarkets = () => {
    try {
      const storedMarkets = localStorage.getItem('aleomarkets');
      if (storedMarkets) {
        const parsedMarkets = JSON.parse(storedMarkets);
        setMarkets(parsedMarkets);
      }
    } catch (error) {
      console.error('Error loading markets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMarkets = filter === 'All'
    ? markets
    : markets.filter(m => m.category === filter);

  const activeMarkets = filteredMarkets.filter(m => !m.resolved);
  const resolvedMarkets = filteredMarkets.filter(m => m.resolved);

  return (
    <div className="min-h-screen bg-black overflow-x-hidden selection:bg-white selection:text-black">
      <div className="fixed inset-0 bg-noise opacity-[0.03] pointer-events-none z-50"></div>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-off-blue/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-new-mint/10 blur-[120px] rounded-full"></div>
      </div>

      <Header />

      <main className="container mx-auto px-4 py-32 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-12 text-sm font-bold uppercase tracking-widest group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>

          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-4">
              <TrendingUp className="w-12 h-12 text-off-blue" />
              <h1 className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500">
                All Markets
              </h1>
            </div>
            <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
              Browse and bet on prediction markets across multiple categories.
            </p>
          </div>

          {/* Filters */}
          <div className="mb-12">
            <div className="flex gap-2">
              {(['All', 'Crypto', 'Politics', 'Sports'] as const).map((f, i) => {
                const activeColor = i === 0 ? 'bg-white text-black border-white' : '';
                const inactiveColor = 'bg-transparent text-gray-500 border-white/20';

                const hoverColor = i === 1 ? 'hover:border-new-blue hover:text-new-blue' :
                  i === 2 ? 'hover:border-new-pink hover:text-new-pink' :
                    i === 3 ? 'hover:border-new-orange hover:text-new-orange' :
                      'hover:border-white hover:text-white';

                return (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-6 py-2 border text-xs font-bold uppercase tracking-wider transition-all rounded-full ${
                      filter === f ? activeColor : `${inactiveColor} ${hoverColor}`
                    }`}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <div className="relative">
              <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-2xl border border-white/10 rounded-xl" />
              <div className="relative p-6">
                <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Total Markets</div>
                <div className="text-3xl font-black text-white">{filteredMarkets.length}</div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-2xl border border-off-green/20 rounded-xl" />
              <div className="relative p-6">
                <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Active</div>
                <div className="text-3xl font-black text-off-green">{activeMarkets.length}</div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-2xl border border-gray-500/20 rounded-xl" />
              <div className="relative p-6">
                <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Resolved</div>
                <div className="text-3xl font-black text-gray-400">{resolvedMarkets.length}</div>
              </div>
            </div>
          </div>

          {/* Active Markets */}
          {activeMarkets.length > 0 && (
            <div className="mb-16">
              <h2 className="text-3xl font-black uppercase tracking-tight mb-6">Active Markets</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                  <div className="col-span-full text-center py-20 text-gray-500">
                    Loading markets...
                  </div>
                ) : (
                  activeMarkets.map((market, index) => (
                    <motion.div
                      key={market.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <MarketCard market={market} />
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Resolved Markets */}
          {resolvedMarkets.length > 0 && (
            <div className="mb-16">
              <h2 className="text-3xl font-black uppercase tracking-tight mb-6">Resolved Markets</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resolvedMarkets.map((market, index) => (
                  <motion.div
                    key={market.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <MarketCard market={market} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredMarkets.length === 0 && !loading && (
            <div className="text-center py-20">
              <p className="text-gray-500 mb-6">No markets found for this category.</p>
              <button
                onClick={() => setFilter('All')}
                className="inline-block px-8 py-4 bg-white text-black hover:bg-gray-200 transition-colors font-bold uppercase tracking-widest text-sm rounded-full"
              >
                View All Markets
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
