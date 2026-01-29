"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Copy } from "lucide-react";
import { PREDICTION_MARKET_ADDRESS, MARKET_CATEGORIES } from "@/lib/contracts/constants";
import { PREDICTION_MARKET_ABI } from "@/lib/contracts/predictionMarket";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function CreateMarketPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clonedFrom, setClonedFrom] = useState(false);
  const [formData, setFormData] = useState({
    question: "",
    category: "Crypto",
    outcomeA: "Yes",
    outcomeB: "No",
    resolutionDate: "",
    resolutionTime: "12:00",
    creatorFee: "0",
  });

  // Check if we're cloning from Polymarket
  useEffect(() => {
    const cloneData = sessionStorage.getItem("cloneMarket");
    if (cloneData) {
      try {
        const data = JSON.parse(cloneData);
        setFormData((prev) => ({
          ...prev,
          question: data.question || "",
          category: data.category || "Crypto",
          resolutionDate: data.endDate || "",
        }));
        setClonedFrom(true);
        sessionStorage.removeItem("cloneMarket");
      } catch (err) {
        console.error("Error loading clone data:", err);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (typeof window.ethereum === "undefined") {
        alert("Please install MetaMask!");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(PREDICTION_MARKET_ADDRESS, PREDICTION_MARKET_ABI, signer);

      // Parse resolution time to timestamp
      const resolutionDateTime = new Date(`${formData.resolutionDate}T${formData.resolutionTime}`);
      const resolutionTimestamp = Math.floor(resolutionDateTime.getTime() / 1000);

      // Creator fee in basis points (0-1000 = 0-10%)
      const creatorFeeBasisPoints = Number(formData.creatorFee) * 100;

      console.log("Creating market with:", {
        question: formData.question,
        category: formData.category,
        outcomeA: formData.outcomeA,
        outcomeB: formData.outcomeB,
        resolutionTime: resolutionTimestamp,
        creatorFee: creatorFeeBasisPoints,
      });

      const tx = await contract.createMarket(
        formData.question,
        formData.category,
        formData.outcomeA,
        formData.outcomeB,
        resolutionTimestamp,
        creatorFeeBasisPoints
      );

      console.log("Transaction sent:", tx.hash);
      await tx.wait();
      console.log("Market created!");

      alert("Market created successfully!");
      router.push("/");
    } catch (error: any) {
      console.error("Failed to create market:", error);
      alert(`Failed to create market: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
            <a
              href="/"
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition"
            >
              Back to Markets
            </a>
          </div>
        </div>
      </nav>

      {/* Create Form */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10"
        >
          {clonedFrom && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 px-4 py-2 rounded-lg border border-purple-500/20 bg-purple-500/10 text-purple-400 flex items-center gap-2 w-fit"
            >
              <Copy className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-widest">Cloned from Polymarket</span>
            </motion.div>
          )}
          <h2 className="text-3xl font-bold text-white mb-2">Create Prediction Market</h2>
          <p className="text-gray-400 mb-8">
            {clonedFrom
              ? "Review and deploy this market to 0G Network"
              : "Create a new prediction market and earn fees from trading volume"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Question */}
            <div>
              <label className="block text-white font-medium mb-2">
                Market Question *
              </label>
              <input
                type="text"
                required
                value={formData.question}
                onChange={(e) => updateFormData("question", e.target.value)}
                placeholder="e.g., Will BTC reach $100k by March 2026?"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-white font-medium mb-2">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => updateFormData("category", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
              >
                {MARKET_CATEGORIES.map((category) => (
                  <option key={category} value={category} className="bg-gray-900">
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Outcomes */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-medium mb-2">
                  Outcome A *
                </label>
                <input
                  type="text"
                  required
                  value={formData.outcomeA}
                  onChange={(e) => updateFormData("outcomeA", e.target.value)}
                  placeholder="Yes"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-2">
                  Outcome B *
                </label>
                <input
                  type="text"
                  required
                  value={formData.outcomeB}
                  onChange={(e) => updateFormData("outcomeB", e.target.value)}
                  placeholder="No"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Resolution Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-medium mb-2">
                  Resolution Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.resolutionDate}
                  onChange={(e) => updateFormData("resolutionDate", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-2">
                  Resolution Time *
                </label>
                <input
                  type="time"
                  required
                  value={formData.resolutionTime}
                  onChange={(e) => updateFormData("resolutionTime", e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Creator Fee */}
            <div>
              <label className="block text-white font-medium mb-2">
                Creator Fee (0-10%)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={formData.creatorFee}
                onChange={(e) => updateFormData("creatorFee", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
              />
              <p className="text-gray-400 text-sm mt-1">
                You'll earn {formData.creatorFee}% of the trading volume. Platform takes 2%.
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
              <h4 className="text-purple-400 font-medium mb-2">📋 Market Details</h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Minimum bet: 0.01 0G</li>
                <li>• Maximum bet: 100 0G</li>
                <li>• Platform fee: 2%</li>
                <li>• Your fee: {formData.creatorFee}%</li>
                <li>• Market locks automatically at resolution time</li>
                <li>• Only trusted resolvers can resolve the market</li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-4 rounded-lg font-medium text-lg transition"
            >
              {loading ? "Creating Market..." : "Create Market"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
