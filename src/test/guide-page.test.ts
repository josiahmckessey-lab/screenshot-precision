import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  GUIDE_CONTACT_LABEL,
  GUIDE_CRISIS_TEXT,
  GUIDE_EMAIL,
  GUIDE_EMAIL_HREF,
  GUIDE_INTRO,
  GUIDE_PHONE,
  GUIDE_PHONE_HREF,
  GUIDE_TITLE,
} from "@/lib/brand";

const guideSource = readFileSync(join(__dirname, "..", "routes", "guide.tsx"), "utf8");

describe("Guide page", () => {
  it("shows the exact guide wording, with professional care in place of the banned word", () => {
    expect(GUIDE_TITLE).toBe("Find a guide");
    expect(GUIDE_INTRO).toBe(
      "A guide is a steady person a little further along the same road, who has walked something similar and walks with another in ordinary life. A guide is not professional care and not crisis care. This library can point toward a guide. It cannot be one.",
    );
    expect(GUIDE_CONTACT_LABEL).toBe("For the pilot, a guide can be reached here:");
    expect(GUIDE_CRISIS_TEXT).toBe(
      "If someone is in danger, call or text 988. For immediate danger, call 911.",
    );
  });

  it("shows the guide contact exactly as given, as a call link and a mail link", () => {
    expect(GUIDE_PHONE).toBe("(407) 243-8448");
    expect(GUIDE_PHONE_HREF).toBe("tel:+14072438448");
    expect(GUIDE_EMAIL).toBe("JosiahMcKessey@proton.me");
    expect(GUIDE_EMAIL_HREF).toBe("mailto:JosiahMcKessey@proton.me");
    expect(guideSource).toContain("GUIDE_PHONE_HREF");
    expect(guideSource).toContain("GUIDE_EMAIL_HREF");
  });

  it("collects no names, emails or other details", () => {
    expect(guideSource).not.toMatch(/<form|<input|textarea|email\s*[:=]/i);
  });
});
