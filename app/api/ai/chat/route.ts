/**
 * AI Chat Assistant API Route
 * Handles conversational AI for prediction market advice
 *
 * POST /api/ai/chat
 */

import { NextRequest, NextResponse } from "next/server";
import { getChatAssistant, ChatMessage, ChatContext } from "@/lib/ai/chat-assistant";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, context } = body as {
      messages: ChatMessage[];
      context?: ChatContext;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: "Messages array required" },
        { status: 400 }
      );
    }

    console.log(`[AI Chat API] Processing chat with ${messages.length} messages`);

    // Get chat assistant
    const assistant = await getChatAssistant();

    // Generate response
    const response = await assistant.chat(messages, context || {});

    console.log("[AI Chat API] Response generated");

    return NextResponse.json({
      success: true,
      response,
    });
  } catch (error: any) {
    console.error("[AI Chat API] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process chat message",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// OPTIONS for CORS if needed
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
