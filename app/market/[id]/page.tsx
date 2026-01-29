"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { PREDICTION_MARKET_ADDRESS } from "@/lib/contracts/constants";
import { PREDICTION_MARKET_ABI, Market, MarketStatus, Outcome, Position } from "@/lib/contracts/predictionMarket";
import { AIInsightsCard } from "@/components/ai/AIInsightsCard";

export default function MarketPage() {
  const params = useParams();
  const marketId = params.id as string;

  const [market, setMarket] = useState<Market | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [userPositions, setUserPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [account, setAccount] = useState<string>("");
  const [betAmount, setBetAmount] = useState("0.1");
  const [selectedOutcome, setSelectedOutcome] = useState<Outcome>(Outcome.OUTCOME_A);
  const [betting, setBetting] = useState(false);

  useEffect(() => {
    connectWallet();
    loadMarket();
  }, [marketId]);

  useEffect(() => {
    if (account) {
      loadUserPositions();
    }
  }, [account, marketId]);

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

  const loadMarket = async () => {
    try {
      const rpcProvider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_ZG_TESTNET_RPC);
      const contract = new ethers.Contract(PREDICTION_MARKET_ADDRESS, PREDICTION_MARKET_ABI, rpcProvider);

      const marketData = await contract.getMarket(marketId);
      setMarket({
        marketId: marketData[0],
        question: marketData[1],
        category: marketData[2],
        creator: marketData[3],
        createdAt: marketData[4],
        resolutionTime: marketData[5],
        status: marketData[6],
        outcomeA: marketData[7],
        outcomeB: marketData[8],
        totalPoolA: marketData[9],
        totalPoolB: marketData[10],
        result: marketData[11],
        proofHash: marketData[12],
        resolver: marketData[13],
        resolvedAt: marketData[14],
        creatorFee: marketData[15],
        platformFee: marketData[16],
      });

      // Load market positions
      const positionIds = await contract.getMarketPositions(marketId);
      const loadedPositions: Position[] = [];

      for (const posId of positionIds) {
        try {
          const posData = await contract.getPosition(posId);
          loadedPositions.push({
            marketId: posData[0],
            bettor: posData[1],
            outcome: posData[2],
            amount: posData[3],
            timestamp: posData[4],
            claimed: posData[5],
          });
        } catch (err) {
          console.error(`Failed to load position ${posId}:`, err);
        }
      }

      setPositions(loadedPositions);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load market:", error);
      setLoading(false);
    }
  };

  const loadUserPositions = async () => {
    try {
      const rpcProvider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_ZG_TESTNET_RPC);
      const contract = new ethers.Contract(PREDICTION_MARKET_ADDRESS, PREDICTION_MARKET_ABI, rpcProvider);

      const positionIds = await contract.getUserPositions(account);
      const userPos: Position[] = [];

      for (const posId of positionIds) {
        try {
          const posData = await contract.getPosition(posId);
          const position: Position = {
            marketId: posData[0],
            bettor: posData[1],
            outcome: posData[2],
            amount: posData[3],
            timestamp: posData[4],
            claimed: posData[5],
          };
          if (position.marketId.toString() === marketId) {
            userPos.push(position);
          }
        } catch (err) {
          console.error(`Failed to load position ${posId}:`, err);
        }
      }

      setUserPositions(userPos);
    } catch (error) {
      console.error("Failed to load user positions:", error);
    }
  };

  const placeBet = async () => {
    if (!provider || !market) return;

    setBetting(true);

    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(PREDICTION_MARKET_ADDRESS, PREDICTION_MARKET_ABI, signer);

      const betValue = ethers.parseEther(betAmount);

      const tx = await contract.placeBet(marketId, selectedOutcome, {
        value: betValue,
      });

      console.log("Transaction sent:", tx.hash);
      await tx.wait();
      console.log("Bet placed!");

      alert("Bet placed successfully!");
      loadMarket();
      loadUserPositions();
    } catch (error: any) {
      console.error("Failed to place bet:", error);
      alert(`Failed to place bet: ${error.message || error}`);
    } finally {
      setBetting(false);
    }
  };

  const formatTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const formatAmount = (amount: bigint) => {
    return ethers.formatEther(amount);
  };

  const calculateOdds = () => {
    if (!market) return { oddsA: 50, oddsB: 50 };
    const totalPool = market.totalPoolA + market.totalPoolB;
    if (totalPool === 0n) {
      return { oddsA: 50, oddsB: 50 };
    }
    const oddsA = Number((market.totalPoolA * 10000n) / totalPool) / 100;
    const oddsB = Number((market.totalPoolB * 10000n) / totalPool) / 100;
    return { oddsA, oddsB };
  };

  const calculatePotentialWinnings = () => {
    if (!market || betAmount === "") return 0;

    const totalPool = market.totalPoolA + market.totalPoolB;
    const betValue = ethers.parseEther(betAmount);
    const currentPool = selectedOutcome === Outcome.OUTCOME_A ? market.totalPoolA : market.totalPoolB;
    const opposingPool = selectedOutcome === Outcome.OUTCOME_A ? market.totalPoolB : market.totalPoolA;

    // Calculate new pool after bet
    const newCurrentPool = currentPool + betValue;
    const newTotalPool = totalPool + betValue;

    // Calculate share of opposing pool
    const shareOfOpposingPool = (betValue * opposingPool) / newCurrentPool;

    // Calculate fees
    const totalFees = (shareOfOpposingPool * (market.creatorFee + market.platformFee)) / 10000n;

    // Winnings = original bet + share of opposing pool - fees
    const winnings = betValue + shareOfOpposingPool - totalFees;

    return Number(formatAmount(winnings));
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
      <span className={`px-3 py-1 rounded text-sm text-white ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  if (loading || !market) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading market...</div>
      </div>
    );
  }

  const odds = calculateOdds();
  const totalPool = market.totalPoolA + market.totalPoolB;
  const potentialWinnings = calculatePotentialWinnings();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <nav className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-bold text-white"
            >
              🔮 Prediction Market
            </motion.h1>
            <div className="flex gap-4">
              {account && (
                <div className="bg-purple-600 text-white px-4 py-2 rounded-lg">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </div>
              )}
              <a
                href="/"
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition"
              >
                Back to Markets
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Market Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex gap-2 mb-3">
                  {getStatusBadge(market.status)}
                  <span className="px-3 py-1 rounded text-sm text-white bg-purple-500/50">
                    {market.category}
                  </span>
                </div>
                <h2 className="text-4xl font-bold text-white mb-3">{market.question}</h2>
                <p className="text-gray-400">
                  Created by {market.creator.slice(0, 6)}...{market.creator.slice(-4)} •{" "}
                  Resolves: {formatTime(market.resolutionTime)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Total Pool</div>
                <div className="text-white text-2xl font-bold">{formatAmount(totalPool)} 0G</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Total Positions</div>
                <div className="text-white text-2xl font-bold">{positions.length}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Fees</div>
                <div className="text-white text-2xl font-bold">
                  {Number(market.creatorFee + market.platformFee) / 100}%
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Betting Panel */}
            <div className="lg:col-span-2 space-y-6">
              {/* Outcomes */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSelectedOutcome(Outcome.OUTCOME_A)}
                  className={`bg-green-500/10 border-2 ${
                    selectedOutcome === Outcome.OUTCOME_A ? "border-green-500" : "border-green-500/20"
                  } rounded-xl p-6 transition hover:border-green-500/50`}
                >
                  <div className="text-green-400 font-medium text-lg mb-2">{market.outcomeA}</div>
                  <div className="text-white text-4xl font-bold mb-2">{odds.oddsA.toFixed(1)}%</div>
                  <div className="text-gray-400">{formatAmount(market.totalPoolA)} 0G</div>
                </button>

                <button
                  onClick={() => setSelectedOutcome(Outcome.OUTCOME_B)}
                  className={`bg-purple-500/10 border-2 ${
                    selectedOutcome === Outcome.OUTCOME_B ? "border-purple-500" : "border-purple-500/20"
                  } rounded-xl p-6 transition hover:border-purple-500/50`}
                >
                  <div className="text-purple-400 font-medium text-lg mb-2">{market.outcomeB}</div>
                  <div className="text-white text-4xl font-bold mb-2">{odds.oddsB.toFixed(1)}%</div>
                  <div className="text-gray-400">{formatAmount(market.totalPoolB)} 0G</div>
                </button>
              </div>

              {/* Bet Form */}
              {market.status === MarketStatus.ACTIVE && (
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h3 className="text-2xl font-bold text-white mb-4">Place Bet</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-white font-medium mb-2">
                        Bet Amount (0G)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max="100"
                        value={betAmount}
                        onChange={(e) => setBetAmount(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                      />
                      <div className="flex gap-2 mt-2">
                        {["0.1", "0.5", "1", "5"].map((amount) => (
                          <button
                            key={amount}
                            onClick={() => setBetAmount(amount)}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white text-sm transition"
                          >
                            {amount} 0G
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-400">Selected Outcome:</span>
                        <span className="text-white font-medium">
                          {selectedOutcome === Outcome.OUTCOME_A ? market.outcomeA : market.outcomeB}
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-400">Bet Amount:</span>
                        <span className="text-white font-medium">{betAmount} 0G</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Potential Winnings:</span>
                        <span className="text-green-400 font-bold">
                          {potentialWinnings.toFixed(4)} 0G
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={placeBet}
                      disabled={betting || !account}
                      className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-4 rounded-lg font-medium text-lg transition"
                    >
                      {!account ? "Connect Wallet" : betting ? "Placing Bet..." : "Place Bet"}
                    </button>
                  </div>
                </div>
              )}

              {/* Your Positions */}
              {userPositions.length > 0 && (
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h3 className="text-2xl font-bold text-white mb-4">Your Positions</h3>
                  <div className="space-y-3">
                    {userPositions.map((pos, i) => (
                      <div key={i} className="bg-white/5 rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <div className="text-white font-medium">
                            {pos.outcome === Outcome.OUTCOME_A ? market.outcomeA : market.outcomeB}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {formatTime(pos.timestamp)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold">{formatAmount(pos.amount)} 0G</div>
                          <div className="text-gray-400 text-sm">
                            {pos.claimed ? "Claimed" : "Active"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: AI Insights + Recent Bets */}
            <div className="space-y-6">
              {/* AI Insights Card */}
              <AIInsightsCard
                marketId={marketId}
                outcomeA={market.outcomeA}
                outcomeB={market.outcomeB}
              />

              {/* Recent Bets */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4">Recent Bets</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {positions.length === 0 ? (
                  <div className="text-gray-400 text-center py-8">No bets yet</div>
                ) : (
                  positions.slice(-10).reverse().map((pos, i) => (
                    <div key={i} className="bg-white/5 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-sm ${pos.outcome === Outcome.OUTCOME_A ? "text-green-400" : "text-purple-400"}`}>
                          {pos.outcome === Outcome.OUTCOME_A ? market.outcomeA : market.outcomeB}
                        </span>
                        <span className="text-white font-bold text-sm">
                          {formatAmount(pos.amount)} 0G
                        </span>
                      </div>
                      <div className="text-gray-500 text-xs">
                        {pos.bettor.slice(0, 6)}...{pos.bettor.slice(-4)}
                      </div>
                    </div>
                  ))
                )}
              </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
