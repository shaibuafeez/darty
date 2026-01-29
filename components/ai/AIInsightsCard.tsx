"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, Zap, TrendingUp, ExternalLink, Loader2, AlertCircle } from "lucide-react";

interface AIInsightsCardProps {
  marketId: string;
  outcomeA: string;
  outcomeB: string;
}

interface MarketAnalysis {
  marketId: string;
  question: string;
  category: string;
  prediction: {
    probability: number;
    confidence: number;
    reasoning: string;
  };
  sources: string[];
  timestamp: number;
  proofHash?: string;
  verifiable: boolean;
}

export function AIInsightsCard({ marketId, outcomeA, outcomeB }: AIInsightsCardProps) {
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalysis();
  }, [marketId]);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/ai/analyze?marketId=${marketId}`);
      const data = await response.json();

      if (data.success) {
        setAnalysis(data.analysis);
      } else {
        setError(data.error || "Failed to load AI analysis");
      }
    } catch (err) {
      console.error("Failed to load AI analysis:", err);
      setError("Failed to connect to AI service");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6 text-purple-400 animate-pulse" />
          <h3 className="text-xl font-bold text-white">AI Analysis</h3>
          <Loader2 className="w-5 h-5 text-purple-400 animate-spin ml-auto" />
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-white/10 rounded animate-pulse" />
          <div className="h-4 bg-white/10 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-white/10 rounded animate-pulse w-1/2" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 backdrop-blur-sm rounded-xl p-6 border border-red-500/20">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-400" />
          <div>
            <h3 className="text-lg font-bold text-white">AI Analysis Unavailable</h3>
            <p className="text-sm text-gray-400 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const probabilityA = analysis.prediction.probability;
  const probabilityB = 100 - probabilityA;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Brain className="w-6 h-6 text-purple-400" />
        <h3 className="text-xl font-bold text-white">AI Prediction</h3>
        <span className="ml-auto text-xs text-gray-400 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          Powered by 0G Compute
        </span>
      </div>

      {/* Probability Meters */}
      <div className="space-y-4 mb-6">
        {/* Outcome A */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-white font-medium">{outcomeA}</span>
            <span className="text-purple-400 font-bold">{probabilityA.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${probabilityA}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 relative"
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </motion.div>
          </div>
        </div>

        {/* Outcome B */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-white font-medium">{outcomeB}</span>
            <span className="text-blue-400 font-bold">{probabilityB.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${probabilityB}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 relative"
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Confidence Score */}
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-4 h-4 text-yellow-400" />
        <span className="text-gray-400">AI Confidence:</span>
        <span className="text-white font-bold">{analysis.prediction.confidence}%</span>
        <div className="flex-1 h-2 bg-white/10 rounded-full ml-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${analysis.prediction.confidence}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-full ${
              analysis.prediction.confidence >= 75
                ? "bg-green-500"
                : analysis.prediction.confidence >= 50
                  ? "bg-yellow-500"
                  : "bg-orange-500"
            }`}
          />
        </div>
      </div>

      {/* Reasoning */}
      <div className="bg-white/5 rounded-lg p-4 mb-4">
        <p className="text-sm text-gray-300 leading-relaxed">
          {analysis.prediction.reasoning}
        </p>
      </div>

      {/* Data Sources */}
      <div className="mb-4">
        <p className="text-xs text-gray-400 mb-2">Analyzed Sources:</p>
        <div className="flex flex-wrap gap-2">
          {analysis.sources.map((source, i) => (
            <span
              key={i}
              className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded border border-purple-500/30"
            >
              {source}
            </span>
          ))}
        </div>
      </div>

      {/* Verification */}
      <div className="flex items-center justify-between text-xs border-t border-white/10 pt-4">
        <div className="flex items-center gap-2">
          {analysis.verifiable ? (
            <span className="text-green-400 flex items-center gap-1">
              ✓ Verifiable Computation
            </span>
          ) : (
            <span className="text-gray-500">Non-verifiable</span>
          )}
        </div>

        {analysis.proofHash && (
          <a
            href={`https://indexer-storage-testnet-turbo.0g.ai/hash/${analysis.proofHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 transition flex items-center gap-1"
          >
            Verify on 0G Storage
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-500 mt-3 italic">
        AI predictions are for informational purposes only. Not financial advice. Always do your
        own research.
      </p>
    </motion.div>
  );
}
