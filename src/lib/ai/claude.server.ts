import { createAnthropic } from "@ai-sdk/anthropic";
import { Output, streamText, type ModelMessage } from "ai";
import type { z } from "zod";
import { createLovableAiGatewayRunIdFetch } from "./run-id.server.ts";

export function createClaudeCalls(key: string, onUsage: (tokens: number) => void) {
  const run = createLovableAiGatewayRunIdFetch();
  const provider = createAnthropic({ baseURL: "https://ai.gateway.lovable.dev/v1", apiKey: key,
    headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" }, fetch: run.fetch });
  return {
    async object<T>(model: string, schema: z.ZodType<T>, system: string, messages: ModelMessage[], budget: number, cache = false): Promise<T> {
      const result = streamText({ model: provider(model), output: Output.object({ schema }), maxOutputTokens: budget, maxRetries: 0,
        system: cache ? [{ role: "system", content: system, providerOptions: { anthropic: { cacheControl: { type: "ephemeral" } } } }] : system,
        messages });
      try {
        const reason = await result.finishReason;
        if (reason === "content-filter") throw new Error("The AI provider declined this request.");
        return await result.output;
      } finally {
        const usage = await Promise.resolve(result.usage).catch(() => undefined);
        if (usage) onUsage(usage.totalTokens ?? ((usage.inputTokens ?? 0)+(usage.outputTokens ?? 0)));
      }
    },
  };
}