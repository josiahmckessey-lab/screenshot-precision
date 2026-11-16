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
    const offenders = [...appFiles, ...publicFiles].filter((f) => banned.test(readFileSync(f, "utf8")));
    expect(offenders.map((f) => relative(root, f))).toEqual([]);
  });

  it("keeps the library (brain_chunks) out of browser code", () => {
    // Only the generated DB types and server-only modules may mention the table.
    const allowed = (f: string) =>
      f.endsWith(join("integrations", "supabase", "types.ts")) || /\.server\.ts$/.test(f);
    const offenders = appFiles.filter((f) => !allowed(f) && readFileSync(f, "utf8").includes("brain_chunks"));
    expect(offenders.map((f) => relative(root, f))).toEqual([]);
  });

  it("uses email magic link only — no password or social sign-in calls", () => {
    const forbidden = /signInWithPassword|signUp\(|signInWithOAuth|updateUser\(\s*\{\s*password/;
    const offenders = appFiles.filter(
      (f) => !f.includes(join("integrations", "")) && forbidden.test(readFileSync(f, "utf8")),
    );
    expect(offenders.map((f) => relative(root, f))).toEqual([]);
  });
});
