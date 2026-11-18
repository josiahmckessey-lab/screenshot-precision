import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "..", "..");

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const appFiles = walk(join(root, "src")).filter(
  (f) => /\.(tsx?|css|json)$/.test(f) && !f.includes(`${join("src", "test")}`) && !f.endsWith("routeTree.gen.ts"),
);
const publicFiles = walk(join(root, "public")).filter((f) => /\.(webmanifest|json|html|txt)$/.test(f));

describe("Product rules", () => {
  it("never uses the banned words in app or public files", () => {
    const banned = /\b(therapy|therapist|therapists|counselor|counselors|counsellor|counseling|counselling|treatment|treatments)\b/i;
    // question-match.ts holds on-device matching keywords that are never shown.
    const offenders = [...appFiles, ...publicFiles].filter((f) => !f.endsWith("question-match.ts") && banned.test(readFileSync(f, "utf8")));
    expect(offenders.map((f) => relative(root, f))).toEqual([]);
  });

  it("keeps the library (brain_chunks) out of browser code", () => {
    // Only the generated DB types and server-only modules may mention the table.
    const allowed = (f: string) =>
      f.endsWith(join("integrations", "supabase", "types.ts")) || /\.server\.ts$/.test(f);
    const offenders = appFiles.filter((f) => !allowed(f) && readFileSync(f, "utf8").includes("brain_chunks"));
    expect(offenders.map((f) => relative(root, f))).toEqual([]);
  });

  it("has no sign-in or accounts in the app", () => {
    const forbidden = /supabase\.auth|signIn|signUp|document\.cookie/;
    const offenders = appFiles.filter(
      (f) => !f.includes(join("integrations", "")) && !f.includes(join("components", "ui")) && forbidden.test(readFileSync(f, "utf8")),
    );
    expect(offenders.map((f) => relative(root, f))).toEqual([]);
  });

  it("keeps the one server function to the topic sorter module", () => {
    const users = appFiles
      .filter((f) => readFileSync(f, "utf8").includes("createServerFn"))
      .map((f) => relative(root, f));
    expect(users).toEqual([join("src", "lib", "match-topics.functions.ts")]);
  });

  it("uses no first- or second-person words in shown copy", async () => {
    const brand = await import("@/lib/brand");
    const words = /\b(i|me|my|we|us|our|you|your|you're|we're)\b/i;
    // A real contact address is data, not prose: ".me" in an email or a tel:/mailto:
    // link must not trip the check on shown copy.
    const isContact = (v: string) =>
      /^(mailto:|tel:)/i.test(v) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    const bad = Object.values(brand).filter(
      (v) => typeof v === "string" && !isContact(v) && words.test(v.replace(/\bUS\b/g, "")),
    );
    expect(bad).toEqual([]);
  });
});
