"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, X, Sparkles, Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface AIAssistantProps {
  userAddress?: string;
  currentMarket?: any;
}

export function AIAssistant({ userAddress, currentMarket }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content:
            "👋 Hi! I'm your AI prediction market advisor powered by 0G Compute. Ask me anything about markets, betting strategies, or how WordWars Arena works!",
          timestamp: Date.now(),
        },
      ]);
      setSuggestions([
        "What markets should I explore?",
        "How do prediction markets work?",
        "What are the fees?",
      ]);
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    const userMessage: Message = {
      role: "user",
      content: messageText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setSuggestions([]);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: {
            userAddress,
            currentPage: pathname,
            currentMarket,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          role: "assistant",
          content: data.response.message,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Update suggestions
        if (data.response.suggestions && data.response.suggestions.length > 0) {
          setSuggestions(data.response.suggestions);
        }
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content:
          "Sorry, I'm having trouble connecting right now. Please try again in a moment! 🔄",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all flex items-center justify-center z-50 group"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-7 h-7 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              className="relative"
            >
              <MessageCircle className="w-7 h-7 text-white" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tooltip */}
        <div className="absolute bottom-full mb-2 right-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-gray-900 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap">
            AI Assistant
          </div>
        </div>
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-28 right-6 w-96 h-[600px] bg-gray-900/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold">AI Market Advisor</h3>
                <p className="text-xs text-purple-100">Powered by 0G Compute</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-purple-600 to-purple-500 text-white rounded-br-sm"
                        : "bg-white/10 text-gray-200 rounded-bl-sm border border-white/10"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/10 px-4 py-3 rounded-2xl rounded-bl-sm border border-white/10 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                    <span className="text-sm text-gray-400">Thinking...</span>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && !loading && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(suggestion)}
                    className="text-xs px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-full border border-purple-500/30 transition"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-gray-900/50">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  disabled={loading}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition disabled:opacity-50"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center hover:shadow-lg hover:shadow-purple-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <Send className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
