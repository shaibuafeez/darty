/**
 * Chat Assistant Agent
 * Personalized AI chatbot for prediction market advice using 0G Compute
 */

import { ZGCompute } from "../0g/compute";
import { Market, Position } from "../contracts/predictionMarket";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: number;
}

export interface ChatContext {
  userAddress?: string;
  currentPage?: string;
  currentMarket?: Market;
  userPositions?: Position[];
  portfolioValue?: string;
}

export interface ChatResponse {
  message: string;
  suggestions?: string[];
  marketRecommendations?: string[];
}

/**
 * Chat Assistant using 0G Compute Network
 */
export class ChatAssistant {
  private compute: ZGCompute;

  constructor(compute: ZGCompute) {
    this.compute = compute;
  }

  /**
   * Send a chat message and get AI response
   */
  async chat(
    messages: ChatMessage[],
    context: ChatContext = {}
  ): Promise<ChatResponse> {
    console.log("[Chat Assistant] Processing message...");

    // Build system prompt with context
    const systemPrompt = this.buildSystemPrompt(context);

    // Prepare messages for AI
    const aiMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    try {
      // Call 0G Compute for AI response
      const result = await this.compute.inference({
        messages: aiMessages,
        temperature: 0.8, // More creative for conversation
        maxTokens: 500,
      });

      // Parse response for suggestions and recommendations
      const response = this.parseResponse(result.content);

      console.log("[Chat Assistant] Response generated");

      return response;
    } catch (error) {
      console.error("[Chat Assistant] Failed to generate response:", error);

      // Fallback response
      return {
        message:
          "I'm having trouble connecting to the AI network. Please try again in a moment. In the meantime, you can explore markets and make your own decisions!",
        suggestions: [
          "Browse all markets",
          "Check your positions",
          "Learn about prediction markets",
        ],
      };
    }
  }

  /**
   * Build system prompt with user context
   */
  private buildSystemPrompt(context: ChatContext): string {
    let prompt = `You are an expert prediction market advisor on WordWars Arena, a decentralized prediction market powered by 0G Network.

Your role is to:
- Help users understand prediction markets
- Provide insights on market opportunities
- Explain market dynamics and odds
- Suggest risk management strategies
- Recommend markets based on user preferences
- Answer questions about how the platform works

IMPORTANT GUIDELINES:
- You are NOT a financial advisor. Always include disclaimers.
- Focus on education and market analysis, not financial advice.
- Be friendly, concise, and helpful.
- Suggest 2-3 actionable next steps when relevant.
- If asked about specific markets, provide balanced analysis.
- Encourage users to do their own research (DYOR).

Platform Features:
- 2% platform fee (88% lower than Polymarket)
- AI-powered market analysis on every market
- Instant resolution via verifiable AI oracles
- Built on 0G Network (near-zero gas fees)
- Clone popular Polymarket markets to 0G
`;

    // Add user context
    if (context.userAddress) {
      prompt += `\n\nUser Address: ${context.userAddress.slice(0, 6)}...${context.userAddress.slice(-4)}`;
    }

    if (context.currentPage) {
      prompt += `\nCurrent Page: ${context.currentPage}`;
    }

    if (context.currentMarket) {
      const market = context.currentMarket;
      prompt += `\n\nCurrent Market:
- Question: ${market.question}
- Category: ${market.category}
- Outcome A: ${market.outcomeA}
- Outcome B: ${market.outcomeB}
- Total Pool: ${Number(market.totalPoolA) + Number(market.totalPoolB)} wei
- Current Odds: ${this.calculateOdds(market)}`;
    }

    if (context.userPositions && context.userPositions.length > 0) {
      prompt += `\n\nUser has ${context.userPositions.length} active position(s) in this market.`;
    }

    if (context.portfolioValue) {
      prompt += `\nPortfolio Value: ${context.portfolioValue} 0G`;
    }

    prompt += `\n\nRespond in a friendly, conversational tone. Keep responses concise (2-3 sentences max). End with 2-3 suggested actions if appropriate.`;

    return prompt;
  }

  /**
   * Parse AI response for structured data
   */
  private parseResponse(content: string): ChatResponse {
    // Try to extract suggestions if AI formatted them
    const suggestionMatch = content.match(
      /(?:suggestions?|next steps?|you (?:can|could|should|might)):\s*(?:\n|^)[-•*]\s*(.+?)(?:\n[-•*]|\n\n|$)/gis
    );

    let suggestions: string[] = [];
    let message = content;

    if (suggestionMatch) {
      // Extract suggestions
      const suggestionText = content.match(/[-•*]\s*(.+?)(?:\n|$)/g);
      if (suggestionText) {
        suggestions = suggestionText
          .map((s) => s.replace(/^[-•*]\s*/, "").trim())
          .filter((s) => s.length > 0)
          .slice(0, 3);

        // Remove suggestions from main message
        message = content.split(/(?:suggestions?|next steps?):/i)[0].trim();
      }
    }

    return {
      message,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    };
  }

  /**
   * Calculate market odds
   */
  private calculateOdds(market: Market): string {
    const poolA = Number(market.totalPoolA);
    const poolB = Number(market.totalPoolB);
    const total = poolA + poolB;

    if (total === 0) return "50% / 50%";

    const oddsA = ((poolA / total) * 100).toFixed(1);
    const oddsB = ((poolB / total) * 100).toFixed(1);

    return `${oddsA}% ${market.outcomeA} / ${oddsB}% ${market.outcomeB}`;
  }

  /**
   * Generate quick suggestions based on context
   */
  async generateSuggestions(context: ChatContext): Promise<string[]> {
    const suggestions: string[] = [];

    if (context.currentMarket) {
      suggestions.push(
        `Analyze "${context.currentMarket.question.slice(0, 40)}..."`
      );
      suggestions.push("Should I bet on this market?");
      suggestions.push("What's the risk here?");
    } else {
      suggestions.push("What markets should I explore?");
      suggestions.push("How does prediction market work?");
      suggestions.push("What are the fees?");
    }

    return suggestions;
  }
}

/**
 * Create singleton chat assistant
 */
let assistantInstance: ChatAssistant | null = null;

export async function getChatAssistant(): Promise<ChatAssistant> {
  if (!assistantInstance) {
    const { getZGCompute } = await import("../0g/compute");
    const compute = await getZGCompute();
    assistantInstance = new ChatAssistant(compute);
  }

  return assistantInstance;
}
