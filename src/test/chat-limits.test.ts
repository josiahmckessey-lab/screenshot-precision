import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { CONSENT_VERSION } from "@/lib/consent-text";
import { SAFETY_RESPONSE, REST_NOTICE } from "@/lib/brand";

const mocks = vi.hoisted(() => ({ rpc: vi.fn(), from: vi.fn(), object: vi.fn() }));
vi.mock("@/integrations/supabase/client.server", () => ({
  supabaseAdmin: { rpc: mocks.rpc, from: mocks.from },
}));
vi.mock("@/lib/ai/claude.server", () => ({
  createClaudeCalls: () => ({ object: mocks.object }),
}));
import { runChat } from "@/lib/chat.server";

const config = {
  daily_request_cap: 40,
  daily_token_cap: 600000,
  global_daily_request_cap: 1000,
  global_daily_token_cap: 5000000,
  request_token_reservation: 30000,
  model_reply: "claude-sonnet-5-5",
  model_crisis_check: "claude-haiku-5-5",
  model_routing: "claude-haiku-5-5",
};
const event = vi.fn();
const userFrom = vi.fn();
const user = { from: userFrom } as unknown as SupabaseClient<Database>;

beforeEach(() => {
  vi.resetAllMocks();
  event.mockResolvedValue({ error: null });
  userFrom.mockImplementation((table: string) => {
    if (table === "crisis_events") return { insert: event };
    return { select: () => ({ eq: () => ({ single: async () => ({
      data: { age_confirmed_at: "2026-11-16", privacy_notice_version: CONSENT_VERSION, verse_offered_at: "2026-11-16" },
      error: null,
    }) }) }) };
  });
  mocks.from.mockImplementation((table: string) => {
    if (table === "ai_access_state") return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }) };
    return { select: async () => ({ data: Object.entries(config).map(([key, value]) => ({ key, value })), error: null }) };
  });
  mocks.rpc.mockResolvedValue({ data: null, error: null });
});

describe("Configurable chat limits and unblocked safety", () => {
  it("uses the 30,000-token reservation read from app_config", async () => {
    await expect(runChat({ message: "A hard day at work" }, "user", user, "test-key")).rejects.toThrow(REST_NOTICE);
    expect(mocks.rpc).toHaveBeenCalledWith("reserve_chat", { _user: "user", _budget: 30000 });
  });

  it("reads changed reservation values on the next request without a rebuild", async () => {
    mocks.from.mockImplementation((table: string) => table === "ai_access_state"
      ? { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }) }
      : { select: async () => ({ data: Object.entries({ ...config, request_token_reservation: 25000 }).map(([key, value]) => ({ key, value })), error: null }) });
    await expect(runChat({ message: "A hard day at work" }, "user", user, "test-key")).rejects.toThrow(REST_NOTICE);
    expect(mocks.rpc).toHaveBeenCalledWith("reserve_chat", { _user: "user", _budget: 25000 });
  });

  it.each([
    ["per-user token cap", 10, 600000, 10, 600000],
    ["40-request daily cap", 40, 0, 40, 0],
    ["global request cap", 0, 0, 1000, 0],
    ["global token cap", 0, 0, 0, 5000000],
  ])("returns fixed safety despite the %s", async (_name, requests, tokens, globalRequests, globalTokens) => {
    // Model the existing database refusal, then prove safety never reaches it.
    mocks.rpc.mockImplementation(async () => ({
      data: requests >= config.daily_request_cap || tokens + config.request_token_reservation > config.daily_token_cap || globalRequests >= config.global_daily_request_cap || globalTokens + config.request_token_reservation > config.global_daily_token_cap ? null : "reservation",
      error: null,
    }));
    await expect(runChat({ message: "I am in danger and might hurt myself" }, "user", user, "test-key")).resolves.toMatchObject({ reply: { mode: "safety", message: SAFETY_RESPONSE }, saved: false });
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(mocks.object).not.toHaveBeenCalled();
    expect(event).toHaveBeenCalledWith({ user_id: "user" });
  });

  it("returns safety before an unavailable key or rate-limited provider can block it", async () => {
    mocks.object.mockRejectedValue({ statusCode: 429 });
    await expect(runChat({ message: "This is an emergency" }, "user", user, undefined)).resolves.toMatchObject({ reply: { mode: "safety", message: SAFETY_RESPONSE } });
    expect(mocks.from).not.toHaveBeenCalled();
    expect(mocks.object).not.toHaveBeenCalled();
  });

  it("returns safety even if text-free event recording fails", async () => {
    event.mockRejectedValue(new Error("Unavailable"));
    await expect(runChat({ message: "I am not safe" }, "user", user, "test-key")).resolves.toMatchObject({ reply: { mode: "safety", message: SAFETY_RESPONSE } });
  });

  it("runs keyword safety before the 2,000-character ordinary-message check", async () => {
    await expect(runChat({ message: "x".repeat(2001) + " emergency" }, "user", user, undefined)).resolves.toMatchObject({ reply: { mode: "safety", message: SAFETY_RESPONSE } });
  });

  it("does not let settlement failure suppress a classifier safety response", async () => {
    mocks.rpc.mockImplementation(async (name: string) => name === "reserve_chat" ? { data: "reservation", error: null } : { data: null, error: { message: "Unavailable" } });
    mocks.object.mockResolvedValue({ unsafe: true });
    await expect(runChat({ message: "Please help me now" }, "user", user, "test-key")).resolves.toMatchObject({ reply: { mode: "safety", message: SAFETY_RESPONSE } });
    expect(mocks.rpc).toHaveBeenCalledWith("settle_chat", { _id: "reservation", _tokens: 0 });
  });
});