/**
 * 0G Compute Network Broker
 * Wrapper for @0glabs/0g-serving-broker to interact with verifiable AI services
 */

import { ethers } from "ethers";
import { createZGComputeNetworkBroker } from "@0glabs/0g-serving-broker";

export interface ZGComputeConfig {
  privateKey: string;
  network?: "testnet" | "mainnet";
  rpcUrl?: string;
}

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIInferenceOptions {
  messages: AIMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIInferenceResult {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  proofHash?: string; // TEEML verification proof
  verifiable: boolean;
}

export interface ServiceMetadata {
  endpoint: string;
  model: string;
  serviceType: string;
  verifiability: string;
  providerAddress: string;
}

/**
 * 0G Compute Broker for AI inference with verifiable proofs
 */
export class ZGCompute {
  private broker: any;
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private config: Required<ZGComputeConfig>;
  private cachedServices: ServiceMetadata[] | null = null;

  constructor(config: ZGComputeConfig) {
    this.config = {
      network: config.network || "testnet",
      rpcUrl:
        config.rpcUrl ||
        (config.network === "mainnet"
          ? "https://evmrpc.0g.ai"
          : "https://evmrpc-testnet.0g.ai"),
      privateKey: config.privateKey,
    };

    this.provider = new ethers.JsonRpcProvider(this.config.rpcUrl);
    this.wallet = new ethers.Wallet(this.config.privateKey, this.provider);
  }

  /**
   * Initialize the broker connection
   * Call this before making inference requests
   */
  async initialize(): Promise<void> {
    if (this.broker) return; // Already initialized

    try {
      console.log("[0G Compute] Initializing broker on", this.config.network);
      this.broker = await createZGComputeNetworkBroker(this.wallet);
      console.log("[0G Compute] Broker initialized successfully");
    } catch (error) {
      console.error("[0G Compute] Failed to initialize broker:", error);
      throw new Error(
        `Failed to initialize 0G Compute broker: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Discover available AI services
   */
  async discoverServices(
    forceRefresh = false
  ): Promise<ServiceMetadata[]> {
    if (!this.broker) {
      await this.initialize();
    }

    // Return cached services unless force refresh
    if (this.cachedServices && !forceRefresh) {
      return this.cachedServices;
    }

    try {
      console.log("[0G Compute] Discovering services...");
      const services = await this.broker.inference.listService();

      // Filter for chatbot services with verifiable computation
      const chatbotServices = services
        .filter((s: any) => s.serviceType === "chatbot")
        .map((s: any) => ({
          endpoint: s.endpoint || s.url,
          model: s.model || "unknown",
          serviceType: s.serviceType,
          verifiability: s.verifiability || "none",
          providerAddress: s.provider || s.providerAddress,
        }));

      this.cachedServices = chatbotServices;
      console.log(`[0G Compute] Found ${chatbotServices.length} chatbot services`);

      return chatbotServices;
    } catch (error) {
      console.error("[0G Compute] Failed to discover services:", error);
      // Return empty array instead of throwing to allow graceful degradation
      return [];
    }
  }

  /**
   * Send inference request to 0G Compute Network
   * Returns AI response with optional verifiable proof
   */
  async inference(options: AIInferenceOptions): Promise<AIInferenceResult> {
    if (!this.broker) {
      await this.initialize();
    }

    try {
      // Get available services
      const services = await this.discoverServices();

      if (services.length === 0) {
        throw new Error("No AI services available on 0G Compute Network");
      }

      // Use first available service (TODO: add service selection logic)
      const service = services[0];
      const providerAddress = service.providerAddress;

      console.log(`[0G Compute] Using service:`, {
        provider: providerAddress,
        model: service.model,
        verifiable: service.verifiability,
      });

      // Get service metadata and headers
      const { endpoint, model } = await this.broker.inference.getServiceMetadata(
        providerAddress
      );
      const headers = await this.broker.inference.getRequestHeaders(
        providerAddress
      );

      // Make inference request
      console.log("[0G Compute] Sending inference request...");
      const response = await fetch(`${endpoint}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify({
          messages: options.messages,
          model: options.model || model,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 1000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Inference request failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      // Process response for fee settlement
      if (data.usage) {
        try {
          await this.broker.inference.processResponse(providerAddress, data);
          console.log("[0G Compute] Fee settlement processed");
        } catch (error) {
          console.warn("[0G Compute] Fee settlement failed:", error);
          // Continue anyway - payment issues shouldn't block response
        }
      }

      // Extract content
      const content = data.choices?.[0]?.message?.content || "";

      // Check if verifiable
      const isVerifiable = service.verifiability?.toLowerCase().includes("teeml");

      // TODO: Extract actual proof hash from response if available
      // For now, we'll generate a placeholder based on the response
      let proofHash: string | undefined;
      if (isVerifiable && data.proofHash) {
        proofHash = data.proofHash;
      }

      return {
        content,
        usage: data.usage
          ? {
              promptTokens: data.usage.prompt_tokens || 0,
              completionTokens: data.usage.completion_tokens || 0,
              totalTokens: data.usage.total_tokens || 0,
            }
          : undefined,
        proofHash,
        verifiable: isVerifiable,
      };
    } catch (error) {
      console.error("[0G Compute] Inference failed:", error);
      throw new Error(
        `AI inference failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Simple chat completion
   * Convenience method for single user messages
   */
  async chat(userMessage: string, systemPrompt?: string): Promise<string> {
    const messages: AIMessage[] = [];

    if (systemPrompt) {
      messages.push({
        role: "system",
        content: systemPrompt,
      });
    }

    messages.push({
      role: "user",
      content: userMessage,
    });

    const result = await this.inference({ messages });
    return result.content;
  }

  /**
   * Get account balance for inference payments
   */
  async getBalance(): Promise<string> {
    const balance = await this.provider.getBalance(this.wallet.address);
    return ethers.formatEther(balance);
  }

  /**
   * Get wallet address
   */
  getAddress(): string {
    return this.wallet.address;
  }
}

/**
 * Create a singleton 0G Compute instance
 * Use this in API routes to avoid multiple initializations
 */
let computeInstance: ZGCompute | null = null;

export async function getZGCompute(): Promise<ZGCompute> {
  if (!computeInstance) {
    const privateKey = process.env.AI_AGENT_PRIVATE_KEY || process.env.PRIVATE_KEY;

    if (!privateKey) {
      throw new Error(
        "AI_AGENT_PRIVATE_KEY or PRIVATE_KEY environment variable required for 0G Compute"
      );
    }

    const network = (process.env.NEXT_PUBLIC_ZG_CHAIN_ID === "16600" ? "mainnet" : "testnet") as "testnet" | "mainnet";

    computeInstance = new ZGCompute({
      privateKey,
      network,
      rpcUrl: process.env.NEXT_PUBLIC_ZG_TESTNET_RPC,
    });

    await computeInstance.initialize();
  }

  return computeInstance;
}
