'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import MarketCard from '@/components/MarketCard';
import PolymarketCard from '@/components/PolymarketCard';
import type { Market } from '@/components/MarketCard';
import type { PolymarketData } from '@/components/PolymarketCard';
import HeroSection from '@/components/marketing/HeroSection';
import TickerStrip from '@/components/marketing/TickerStrip';
import HowItWorks from '@/components/marketing/HowItWorks';
import Leaderboard from '@/components/marketing/Leaderboard';
import TrustSection from '@/components/marketing/TrustSection';
import { ExternalLink } from 'lucide-react';

export default function Home() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [polymarkets, setPolymarkets] = useState<PolymarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [polyLoading, setPolyLoading] = useState(true);

  useEffect(() => {
    // Load markets from localStorage
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

    // Fetch Polymarket data
    fetchPolymarkets();
  }, []);

  const fetchPolymarkets = async () => {
    try {
      const response = await fetch('/api/polymarket?limit=12');
      const data = await response.json();
      if (data.success) {
        setPolymarkets(data.markets);
      }
    } catch (error) {
      console.error('Error fetching Polymarket data:', error);
    } finally {
      setPolyLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-black overflow-x-hidden selection:bg-white selection:text-black">
      <Header />

      <main>
        <HeroSection />

        <TickerStrip />

        {/* Markets Section */}
        <section id="markets" className="py-24 px-4 bg-black borders-t border-white/10">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
              <div>
                <h2 className="text-4xl font-black text-white mb-2 tracking-tighter uppercase">Live Markets</h2>
                <div className="h-1 w-20 bg-white"></div>
              </div>

              <div className="flex gap-2">
                {['All', 'Crypto', 'Politics', 'Sports'].map((filter, i) => {
                  // Assign a color based on index
                  const activeColor = i === 0 ? 'bg-white text-black border-white' : '';
                  const inactiveColor = 'bg-transparent text-gray-500 border-white/20';

                  // Specific hover colors
                  const hoverColor = i === 1 ? 'hover:border-new-blue hover:text-new-blue' :
                    i === 2 ? 'hover:border-new-pink hover:text-new-pink' :
                      i === 3 ? 'hover:border-new-orange hover:text-new-orange' :
                        'hover:border-white hover:text-white';

                  return (
                    <button
                      key={filter}
                      className={`px-6 py-2 border text-xs font-bold uppercase tracking-wider transition-all rounded-full ${i === 0 ? activeColor : `${inactiveColor} ${hoverColor}`}`}
                    >
                      {filter}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Market Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full text-center py-20 text-gray-500">
                  Loading markets...
                </div>
              ) : markets.length === 0 ? (
                <div className="col-span-full text-center py-20">
                  <p className="text-gray-500 mb-6">No markets yet. Be the first to create one!</p>
                  <a
                    href="/create"
                    className="inline-block px-8 py-4 bg-white text-black hover:bg-gray-200 transition-colors font-bold uppercase tracking-widest text-sm rounded-full"
                  >
                    Create Market
                  </a>
                </div>
              ) : (
                markets.map((market, index) => (
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

            {markets.length > 0 && (
              <div className="text-center mt-16">
                <div className="text-gray-400 text-sm">
                  Showing {markets.length} market{markets.length !== 1 ? 's' : ''}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Polymarket Markets Section */}
        <section id="polymarket" className="py-24 px-4 bg-black border-t border-white/10">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
                    Trending on Polymarket
                  </h2>
                </div>
                <div className="h-1 w-20 bg-white mb-4"></div>
                <p className="text-gray-400 max-w-2xl text-sm font-medium">
                  Popular prediction markets from the wider ecosystem.
                  <br />
                  <span className="text-white">Clone them to Aleo</span> for true privacy.
                </p>
              </div>
            </div>

            {/* Stats Overview */}
            {!polyLoading && polymarkets.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                <div className="bg-neutral-900/50 border border-white/10 rounded-xl p-6">
                  <div className="text-sm text-gray-500 uppercase tracking-wider font-bold mb-2">Markets</div>
                  <div className="text-3xl font-black text-white">{polymarkets.length}</div>
                </div>
                <div className="bg-neutral-900/50 border border-white/10 rounded-xl p-6">
                  <div className="text-sm text-gray-500 uppercase tracking-wider font-bold mb-2">Total Volume</div>
                  <div className="text-3xl font-black text-white">
                    ${(polymarkets.reduce((sum, m) => sum + m.volume, 0) / 1000000).toFixed(1)}M
                  </div>
                </div>
                <div className="bg-neutral-900/50 border border-white/10 rounded-xl p-6">
                  <div className="text-sm text-gray-500 uppercase tracking-wider font-bold mb-2">Live Prices</div>
                  <div className="text-3xl font-black text-white">
                    {polymarkets.filter(m => m.hasLivePrice).length}
                  </div>
                </div>
                <div className="bg-neutral-900/50 border border-white/10 rounded-xl p-6">
                  <div className="text-sm text-gray-500 uppercase tracking-wider font-bold mb-2">Categories</div>
                  <div className="text-3xl font-black text-white">
                    {new Set(polymarkets.map(m => m.category)).size}
                  </div>
                </div>
              </div>
            )}

            {/* Polymarket Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {polyLoading ? (
                <div className="col-span-full text-center py-20 text-gray-500 font-mono text-sm uppercase tracking-widest">
                  • Loading Global Markets •
                </div>
              ) : polymarkets.length === 0 ? (
                <div className="col-span-full text-center py-20 text-gray-500">
                  Could not load Polymarket data
                </div>
              ) : (
                polymarkets.map((market, index) => (
                  <motion.div
                    key={market.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <PolymarketCard market={market} />
                  </motion.div>
                ))
              )}
            </div>

            {polymarkets.length > 0 && (
              <div className="text-center mt-12">
                <a
                  href="https://polymarket.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-transparent border border-white/20 text-white hover:bg-white hover:text-black transition-all font-bold uppercase tracking-widest text-sm rounded-full"
                >
                  <ExternalLink className="w-4 h-4" />
                  View All on Polymarket
                </a>
              </div>
            )}
          </div>
        </section>

        <HowItWorks />

        <Leaderboard />

        <TrustSection />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-20 px-4 bg-black">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 pr-12">
              <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">Dart</h3>
              <p className="text-gray-500 max-w-sm text-sm leading-relaxed">
                The world's first privacy-preserving prediction market.
                Built on Aleo.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6 uppercase text-sm tracking-wider">Platform</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><a href="/markets" className="hover:text-white transition-colors">Markets</a></li>
                <li><a href="/portfolio" className="hover:text-white transition-colors">Portfolio</a></li>
                <li><a href="/leaderboard" className="hover:text-white transition-colors">Leaderboard</a></li>
                <li><a href="/how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="/admin" className="hover:text-white transition-colors">Admin</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6 uppercase text-sm tracking-wider">Community</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Oscillate</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Github</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-xs text-gray-600 uppercase tracking-wider">
              © 2026 Dart.
            </div>
            <div className="text-xs text-gray-600 uppercase tracking-wider">
              Built on Aleo
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
