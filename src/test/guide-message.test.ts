import { beforeEach, describe, expect, it, vi } from "vitest";
import { canSendGuide, GUIDE_DAILY_CAP, guideEmailText, guideMessageSchema, recordGuideSend, saveThenNotify } from "@/lib/guide-message";

const input = { body: "a", website: "" };
describe("Guide submission rules", () => {
  beforeEach(() => localStorage.clear());
  it("requires 1 to 3000 message characters", () => {
    expect(guideMessageSchema.safeParse(input).success).toBe(true);
    expect(guideMessageSchema.safeParse({ ...input, body: "" }).success).toBe(false);
    expect(guideMessageSchema.safeParse({ ...input, body: "a".repeat(3000) }).success).toBe(true);
    expect(guideMessageSchema.safeParse({ ...input, body: "a".repeat(3001) }).success).toBe(false);
  });
  it("permits an optional valid reply address at most 200 characters", () => {
    expect(guideMessageSchema.safeParse({ ...input, reply_to: "" }).success).toBe(true);
    expect(guideMessageSchema.safeParse({ ...input, reply_to: "guide@example.com" }).success).toBe(true);
    expect(guideMessageSchema.safeParse({ ...input, reply_to: "not an address" }).success).toBe(false);
    expect(guideMessageSchema.safeParse({ ...input, reply_to: "a".repeat(201) }).success).toBe(false);
  });
  it("caps the included question at 2000 characters", () => {
    expect(guideMessageSchema.safeParse({ ...input, included_question: "q".repeat(2000) }).success).toBe(true);
    expect(guideMessageSchema.safeParse({ ...input, included_question: "q".repeat(2001) }).success).toBe(false);
  });
  it("rejects a reply address that does not look like an email", () => {
    const field = guideMessageSchema.shape.reply_to;
    expect(field.safeParse("not-an-address").success).toBe(false);
    expect(field.safeParse("missing@dot").success).toBe(false);
    expect(field.safeParse("guide@example.com").success).toBe(true);
    expect(field.safeParse("").success).toBe(true);
  });
  it("puts the reply address as the first line of the email body", () => {
    expect(guideEmailText({ body: "hello", website: "", reply_to: "guide@example.com" }).startsWith("Reply email: guide@example.com\n")).toBe(true);
    expect(guideEmailText({ body: "hello", website: "" }).startsWith("Reply email: none given\n")).toBe(true);
    expect(guideEmailText({ body: "hello", website: "", reply_to: "" }).startsWith("Reply email: none given\n")).toBe(true);
  });
  it("rejects a filled honeypot", () => {
    expect(guideMessageSchema.safeParse({ ...input, website: "spam" }).success).toBe(false);
  });
  it("allows only five device messages per rolling hour", () => {
    for (let i = 0; i < 5; i++) { expect(canSendGuide(localStorage, 10000)).toBe(true); recordGuideSend(localStorage, 10000); }
    expect(canSendGuide(localStorage, 10001)).toBe(false);
    expect(canSendGuide(localStorage, 3610000)).toBe(true);
  });
  it("acknowledges a saved row even when email fails", async () => {
    const saved: string[] = [];
    expect(await saveThenNotify(async () => { saved.push("row"); return "id"; }, async () => { throw new Error("failed"); })).toEqual({ status: "received" });
    expect(saved).toEqual(["row"]);
  });
  it("does not send email when the daily cap refuses the insert", async () => {
    const notify = vi.fn();
    expect(await saveThenNotify(async () => null, notify)).toEqual({ status: "capped" });
    expect(notify).not.toHaveBeenCalled();
    expect(GUIDE_DAILY_CAP).toBe(100);
  });
});