import { readFileSync } from "node:fs";
import { describe, expect, it, vi, afterEach } from "vitest";
import { z } from "zod";
import { createClaudeCalls } from "../lib/ai/claude.server";

afterEach(() => vi.unstubAllGlobals());

describe("Direct Anthropic chat", () => {
  it.each(["claude-sonnet-5-5", "claude-haiku-5-5"])("streams %s directly without gateway headers", async (model) => {
    const frames = [
      { type: "message_start", message: { id: "test", type: "message", role: "assistant", model, content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 10, output_tokens: 0 } } },
      { type: "content_block_start", index: 0, content_block: { type: "text", text: "" } },
      { type: "content_block_delta", index: 0, delta: { type: "text_delta", text: '{"unsafe":false}' } },
      { type: "content_block_stop", index: 0 },
      { type: "message_delta", delta: { stop_reason: "end_turn", stop_sequence: null }, usage: { output_tokens: 5 } },
      { type: "message_stop" },
    ];
    const transport = vi.fn(async () => new Response(frames.map(frame => `event: ${frame.type}\ndata: ${JSON.stringify(frame)}\n\n`).join(""), { headers: { "content-type": "text/event-stream" } }));
    vi.stubGlobal("fetch", transport);
    const usage = vi.fn();
    const result = await createClaudeCalls("test-only-credential", usage).object(model, z.object({ unsafe: z.boolean() }), "Classify safety.", [{ role: "user", content: "A quiet day." }], 256);
    expect(result).toEqual({ unsafe: false });
    expect(transport).toHaveBeenCalledTimes(1);
    const [url, init] = transport.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.anthropic.com/v1/messages");
    const headers = new Headers(init.headers);
    expect(headers.get("x-api-key")).toBe("test-only-credential");
    expect(headers.has("Lovable-API-Key")).toBe(false);
    expect(headers.has("X-Lovable-AIG-SDK")).toBe(false);
    expect(headers.has("X-Lovable-AIG-Run-ID")).toBe(false);
    expect(JSON.parse(String(init.body))).toMatchObject({ model, stream: true, max_tokens: 256 });
    expect(usage).toHaveBeenCalledWith(15);
  });

  it("reads the Anthropic secret only inside the server handler", () => {
    const source = readFileSync(new URL("../lib/chat.functions.ts", import.meta.url), "utf8");
    expect(source).toContain("process.env['ANTHROPIC_API_KEY']");
    expect(source.indexOf("process.env['ANTHROPIC_API_KEY']")).toBeGreaterThan(source.indexOf(".handler("));
    expect(source).not.toContain("LOVABLE_API_KEY");
  });
});