/**
 * AI Market Analysis API Route
 * Provides AI-powered predictions for prediction markets
 *
 * GET /api/ai/analyze?marketId=123
 */

import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { getMarketAnalyzer } from "@/lib/ai/market-analyzer";
import { PREDICTION_MARKET_ADDRESS } from "@/lib/contracts/constants";
import { PREDICTION_MARKET_ABI, Market } from "@/lib/contracts/predictionMarket";

// In-memory cache for AI analyses (5 minute TTL)
interface CachedAnalysis {
  data: any;
  timestamp: number;
}

const analysisCache = new Map<string, CachedAnalysis>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const marketId = searchParams.get("marketId");

    if (!marketId) {
      return NextResponse.json(
        { success: false, error: "Market ID required" },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = `market-${marketId}`;
    const cached = analysisCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`[AI Analysis API] Cache hit for market ${marketId}`);
      return NextResponse.json({
        success: true,
        analysis: cached.data,
        cached: true,
      });
    }

    // Fetch market data from blockchain
    console.log(`[AI Analysis API] Fetching market ${marketId} from blockchain...`);

    const provider = new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_ZG_TESTNET_RPC
    );

    const contract = new ethers.Contract(
      PREDICTION_MARKET_ADDRESS,
      PREDICTION_MARKET_ABI,
      provider
    );

    const marketData = await contract.getMarket(marketId);

    // Convert to Market interface
    const market: Market = {
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
    };

    console.log(`[AI Analysis API] Market fetched: ${market.question}`);

    // Get AI analyzer and perform analysis
    const analyzer = await getMarketAnalyzer();
    const analysis = await analyzer.analyzeMarket(market, {
      storeOnChain: true, // Store on 0G Storage
    });

    console.log(`[AI Analysis API] Analysis complete for market ${marketId}`);

    // Cache the result
    analysisCache.set(cacheKey, {
      data: analysis,
      timestamp: Date.now(),
    });

    // Clean up old cache entries (simple LRU)
    if (analysisCache.size > 100) {
      const oldestKey = Array.from(analysisCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
      analysisCache.delete(oldestKey);
    }

    return NextResponse.json({
      success: true,
      analysis,
      cached: false,
    });
  } catch (error: any) {
    console.error("[AI Analysis API] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to analyze market",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// Optional: Clear cache endpoint for admin use
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const marketId = searchParams.get("marketId");

    if (marketId) {
      analysisCache.delete(`market-${marketId}`);
      return NextResponse.json({
        success: true,
        message: `Cache cleared for market ${marketId}`,
      });
    } else {
      analysisCache.clear();
      return NextResponse.json({
        success: true,
        message: "All cache cleared",
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
