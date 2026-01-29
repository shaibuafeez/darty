/**
 * Market Analyzer Agent
 * Uses 0G Compute for AI-powered market analysis and predictions
 */

import { Market, MarketStatus } from "../contracts/predictionMarket";
import { ZGCompute } from "../0g/compute";
import { ZGStorage } from "../0g/storage";
import { ethers } from "ethers";

export interface MarketAnalysis {
  marketId: string;
  question: string;
  category: string;
  prediction: {
    probability: number; // 0-100 for outcome A
    confidence: number; // 0-100 confidence in prediction
    reasoning: string; // Natural language explanation
  };
  sources: string[]; // Data sources consulted
  timestamp: number;
  proofHash?: string; // 0G Storage proof hash
  verifiable: boolean; // Whether AI computation was verifiable (TEEML)
}

export interface AnalysisOptions {
  includeHistoricalData?: boolean;
  includeSentimentAnalysis?: boolean;
  storeOnChain?: boolean; // Store result on 0G Storage
}

/**
 * Market Analyzer using 0G Compute Network
 */
export class MarketAnalyzer {
  private compute: ZGCompute;
  private storage: ZGStorage;

  constructor(compute: ZGCompute, storage: ZGStorage) {
    this.compute = compute;
    this.storage = storage;
  }

  /**
   * Analyze a prediction market and generate AI prediction
   */
  async analyzeMarket(
    market: Market,
    options: AnalysisOptions = {}
  ): Promise<MarketAnalysis> {
    console.log(`[Market Analyzer] Analyzing market ${market.marketId}`);

    // Calculate current odds from pools
    const totalPool = Number(market.totalPoolA) + Number(market.totalPoolB);
    const currentOddsA =
      totalPool > 0
        ? (Number(market.totalPoolA) / totalPool) * 100
        : 50;

    // Build analysis prompt
    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(market, currentOddsA, totalPool);

    try {
      // Call 0G Compute for AI inference
      const result = await this.compute.inference({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        maxTokens: 800,
      });

      // Parse AI response
      const analysis = this.parseAIResponse(
        result.content,
        market,
        result.verifiable,
        result.proofHash
      );

      // Optionally store on 0G Storage
      if (options.storeOnChain && analysis.proofHash === undefined) {
        try {
          const uploadResult = await this.storage.uploadAnalysis({
            marketId: market.marketId.toString(),
            question: market.question,
            prediction: analysis.prediction,
            sources: analysis.sources,
            timestamp: analysis.timestamp,
          });

          analysis.proofHash = uploadResult.rootHash;
          console.log(
            `[Market Analyzer] Stored on 0G Storage: ${uploadResult.rootHash}`
          );
        } catch (error) {
          console.warn("[Market Analyzer] Failed to store on 0G Storage:", error);
          // Continue anyway - storage failure shouldn't block analysis
        }
      }

      return analysis;
    } catch (error) {
      console.error("[Market Analyzer] Analysis failed:", error);

      // Fallback: Return a basic analysis based on current odds
      return this.generateFallbackAnalysis(market, currentOddsA);
    }
  }

  /**
   * Build system prompt for AI analysis
   */
  private buildSystemPrompt(): string {
    return `You are an expert prediction market analyst with deep knowledge of:
- Market dynamics and betting psychology
- Statistical analysis and probability theory
- Current events and trends across multiple domains (crypto, politics, sports, tech)
- Historical market performance and accuracy

Your task is to analyze prediction markets and provide:
1. A probability estimate (0-100%) for Outcome A
2. Your confidence level (0-100%) in this prediction
3. Clear reasoning (2-3 sentences) explaining your analysis
4. Key factors influencing the outcome

Be analytical, objective, and cite specific reasoning. DO NOT provide financial advice.
Format your response as JSON with this structure:
{
  "probability": <number 0-100>,
  "confidence": <number 0-100>,
  "reasoning": "<2-3 sentences>",
  "factors": ["<factor1>", "<factor2>", "<factor3>"],
  "sources": ["<source1>", "<source2>"]
}`;
  }

  /**
   * Build user prompt with market context
   */
  private buildUserPrompt(
    market: Market,
    currentOddsA: number,
    totalPool: number
  ): string {
    const resolutionDate = new Date(Number(market.resolutionTime) * 1000);
    const poolInEther = ethers.formatEther(totalPool.toString());

    return `Analyze this prediction market:

**Question**: ${market.question}
**Category**: ${market.category}
**Resolution Date**: ${resolutionDate.toLocaleDateString()}
**Time Until Resolution**: ${this.getTimeUntilResolution(market.resolutionTime)}

**Current Market Data**:
- Total Pool: ${poolInEther} 0G
- Current Odds: ${market.outcomeA} (${currentOddsA.toFixed(1)}%) vs ${market.outcomeB} (${(100 - currentOddsA).toFixed(1)}%)
- Pool for ${market.outcomeA}: ${ethers.formatEther(market.totalPoolA)} 0G
- Pool for ${market.outcomeB}: ${ethers.formatEther(market.totalPoolB)} 0G

Provide your analysis as JSON focusing on probability that **${market.outcomeA}** will occur.`;
  }

  /**
   * Parse AI response into structured analysis
   */
  private parseAIResponse(
    content: string,
    market: Market,
    verifiable: boolean,
    aiProofHash?: string
  ): MarketAnalysis {
    try {
      // Extract JSON from response (AI might add markdown formatting)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in AI response");
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        marketId: market.marketId.toString(),
        question: market.question,
        category: market.category,
        prediction: {
          probability: Math.min(100, Math.max(0, parsed.probability || 50)),
          confidence: Math.min(100, Math.max(0, parsed.confidence || 50)),
          reasoning:
            parsed.reasoning ||
            "AI analysis completed. See factors for details.",
        },
        sources: parsed.sources || ["0G Compute AI Analysis", "Market data"],
        timestamp: Date.now(),
        proofHash: aiProofHash,
        verifiable,
      };
    } catch (error) {
      console.warn("[Market Analyzer] Failed to parse AI response:", error);

      // Fallback parsing: extract probability from text
      const probabilityMatch = content.match(/probability[^\d]*(\d+)/i);
      const confidenceMatch = content.match(/confidence[^\d]*(\d+)/i);

      return {
        marketId: market.marketId.toString(),
        question: market.question,
        category: market.category,
        prediction: {
          probability: probabilityMatch ? parseInt(probabilityMatch[1]) : 50,
          confidence: confidenceMatch ? parseInt(confidenceMatch[1]) : 60,
          reasoning: content.slice(0, 300),
        },
        sources: ["0G Compute AI Analysis"],
        timestamp: Date.now(),
        proofHash: aiProofHash,
        verifiable,
      };
    }
  }

  /**
   * Generate fallback analysis when AI fails
   */
  private generateFallbackAnalysis(
    market: Market,
    currentOddsA: number
  ): MarketAnalysis {
    return {
      marketId: market.marketId.toString(),
      question: market.question,
      category: market.category,
      prediction: {
        probability: Math.round(currentOddsA),
        confidence: 40,
        reasoning: `Based on current market odds. AI analysis temporarily unavailable - showing market consensus as probability estimate.`,
      },
      sources: ["Market pool data"],
      timestamp: Date.now(),
      verifiable: false,
    };
  }

  /**
   * Calculate time until market resolution
   */
  private getTimeUntilResolution(resolutionTime: bigint): string {
    const now = Date.now();
    const resolutionMs = Number(resolutionTime) * 1000;
    const diff = resolutionMs - now;

    if (diff < 0) return "Already passed";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days} day${days !== 1 ? "s" : ""}, ${hours} hour${hours !== 1 ? "s" : ""}`;
    } else if (hours > 0) {
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours} hour${hours !== 1 ? "s" : ""}, ${minutes} minute${minutes !== 1 ? "s" : ""}`;
    } else {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
    }
  }

  /**
   * Batch analyze multiple markets
   */
  async analyzeMarkets(
    markets: Market[],
    options: AnalysisOptions = {}
  ): Promise<MarketAnalysis[]> {
    console.log(`[Market Analyzer] Batch analyzing ${markets.length} markets`);

    // Filter only active markets
    const activeMarkets = markets.filter((m) => m.status === MarketStatus.ACTIVE);

    // Analyze in parallel (rate limited by 0G Compute)
    const analyses = await Promise.all(
      activeMarkets.map((market) => this.analyzeMarket(market, options))
    );

    return analyses;
  }
}

/**
 * Create singleton market analyzer
 */
let analyzerInstance: MarketAnalyzer | null = null;

export async function getMarketAnalyzer(): Promise<MarketAnalyzer> {
  if (!analyzerInstance) {
    // Dynamic imports to avoid circular dependencies
    const { getZGCompute } = await import("../0g/compute");
    const { getZGStorage } = await import("../0g/storage");

    const compute = await getZGCompute();
    const storage = await getZGStorage();

    analyzerInstance = new MarketAnalyzer(compute, storage);
  }

  return analyzerInstance;
}
