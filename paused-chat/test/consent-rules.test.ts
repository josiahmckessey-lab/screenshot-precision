import { describe, expect, it } from "vitest";
import { canContinueAge, nextConsent } from "@/lib/consent-rules";

describe("Welcome and optional consent", () => {
  it("stops an unchecked age confirmation", () => { expect(canContinueAge(false)).toBe(false); });
  it("allows a checked 18+ confirmation", () => { expect(canContinueAge(true)).toBe(true); });
  it("allows both choices to remain off", () => {
    expect(nextConsent({ consent_save: false, consent_share: false }, "save", false)).toEqual({ consent_save: false, consent_share: false });
  });
  it("does not enable review without saving", () => {
    expect(nextConsent({ consent_save: false, consent_share: false }, "share", true).consent_share).toBe(false);
  });
  it("saving alone does not grant builder review", () => {
    expect(nextConsent({ consent_save: false, consent_share: false }, "save", true)).toEqual({ consent_save: true, consent_share: false });
  });
  it("permits separately opted-in review with saving", () => {
    expect(nextConsent({ consent_save: true, consent_share: false }, "share", true).consent_share).toBe(true);
  });
  it("revokes builder review when saving is turned off", () => {
    expect(nextConsent({ consent_save: true, consent_share: true }, "save", false)).toEqual({ consent_save: false, consent_share: false });
  });
});