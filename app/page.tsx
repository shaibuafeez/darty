"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { motion } from "framer-motion";
import { PREDICTION_MARKET_ADDRESS } from "@/lib/contracts/constants";
import { PREDICTION_MARKET_ABI, Market, MarketStatus, Outcome } from "@/lib/contracts/predictionMarket";
import PolymarketCard, { type PolymarketData } from "@/components/PolymarketCard";
import Hero from "@/components/Hero";
import TrustSection from "@/components/TrustSection";
import HowItWorks from "@/components/HowItWorks";
import MarketsSection from "@/components/MarketsSection";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function HomePage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [polymarkets, setPolymarkets] = useState<PolymarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [polyLoading, setPolyLoading] = useState(true);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [account, setAccount] = useState<string>("");

  useEffect(() => {
    connectWallet();
    loadMarkets();
    loadPolymarkets();
  }, []);

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await browserProvider.send("eth_requestAccounts", []);
        setProvider(browserProvider);
        setAccount(accounts[0]);
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
    }
  };

  const loadMarkets = async () => {
    try {
      if (!PREDICTION_MARKET_ADDRESS) {
        console.error("Contract address not set");
        setLoading(false);
        return;
      }

      const rpcProvider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_ZG_TESTNET_RPC);
      const contract = new ethers.Contract(PREDICTION_MARKET_ADDRESS, PREDICTION_MARKET_ABI, rpcProvider);

      const totalMarkets = await contract.totalMarkets();
      const loadedMarkets: Market[] = [];

      // Load last 10 markets
      const start = totalMarkets > 10n ? totalMarkets - 10n : 1n;
      for (let i = start; i < totalMarkets + 1n; i++) {
        try {
          const market = await contract.getMarket(i);
          loadedMarkets.push({
            marketId: market[0],
            question: market[1],
            category: market[2],
            creator: market[3],
            createdAt: market[4],
            resolutionTime: market[5],
            status: market[6],
            outcomeA: market[7],
            outcomeB: market[8],
            totalPoolA: market[9],
            totalPoolB: market[10],
            result: market[11],
            proofHash: market[12],
            resolver: market[13],
            resolvedAt: market[14],
            creatorFee: market[15],
            platformFee: market[16],
          });
        } catch (err) {
          console.error(`Failed to load market ${i}:`, err);
        }
      }

      setMarkets(loadedMarkets.reverse());
      setLoading(false);
    } catch (error) {
      console.error("Failed to load markets:", error);
      setLoading(false);
    }
  };

  const loadPolymarkets = async () => {
    try {
      const response = await fetch("/api/polymarket?limit=12");
      const data = await response.json();

      if (data.success) {
        setPolymarkets(data.markets);
      }
      setPolyLoading(false);
    } catch (error) {
      console.error("Failed to load Polymarket data:", error);
      setPolyLoading(false);
    }
  };

  const formatTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

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

  const getStatusBadge = (status: MarketStatus) => {
    const badges = {
      [MarketStatus.ACTIVE]: { text: "Active", color: "bg-green-500" },
      [MarketStatus.LOCKED]: { text: "Locked", color: "bg-yellow-500" },
      [MarketStatus.RESOLVED]: { text: "Resolved", color: "bg-blue-500" },
      [MarketStatus.CANCELLED]: { text: "Cancelled", color: "bg-red-500" },
    };
    const badge = badges[status];
    return (
      <span className={`px-2 py-1 rounded text-xs text-white ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const getOutcomeBadge = (result: Outcome) => {
    const badges = {
      [Outcome.PENDING]: { text: "Pending", color: "bg-gray-500" },
      [Outcome.OUTCOME_A]: { text: "Outcome A", color: "bg-green-500" },
      [Outcome.OUTCOME_B]: { text: "Outcome B", color: "bg-purple-500" },
      [Outcome.INVALID]: { text: "Invalid", color: "bg-red-500" },
    };
    const badge = badges[result];
    return (
      <span className={`px-2 py-1 rounded text-xs text-white ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <Navbar account={account} connectWallet={connectWallet} />

      <Hero />

      <MarketsSection markets={markets} loading={loading} />

      <TrustSection />

      <HowItWorks />

      {/* Polymarket Section */}
      <div className="mt-24 pt-12 border-t border-white/10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Clone from Polymarket</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Bring popular prediction markets to 0G Network. Hover over any market and click "Clone to 0G" to deploy it with lower fees and transparent resolution.
          </p>
        </div>

        {polyLoading ? (
          <div className="text-center text-white text-xl">Loading Polymarket data...</div>
        ) : polymarkets.length === 0 ? (
          <div className="text-center bg-white/5 backdrop-blur-sm rounded-xl p-12 border border-white/10">
            <p className="text-gray-400">Failed to load Polymarket data</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {polymarkets.map((market, i) => (
                <PolymarketCard key={market.id} market={market} />
              ))}
            </div>

            <div className="text-center">
              <a
                href="https://polymarket.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-purple-400 hover:text-purple-300 text-sm font-medium transition"
              >
                View more on Polymarket →
              </a>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
