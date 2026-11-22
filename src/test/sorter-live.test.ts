import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";
import fixtures from "./fixtures/sorter-set.json";
import type { MatchTopicsResult } from "@/lib/match-topics.functions";

// Exercise the actual RPC on the running app, including its real configuration,
// public library reads, cap and provider call. No question records are inserted.
describe.skipIf(!process.env["ANTHROPIC_API_KEY"])("Live topic sorter", () => {
  it("matches the supplied set and flags only the crisis message", async () => {
    const script = `
import asyncio, json
from playwright.async_api import async_playwright
async def main():
    with open('src/test/fixtures/sorter-set.json') as f:
        cases = json.load(f)
    results = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width":1280,"height":1800})
        await page.goto('http://localhost:8080', wait_until='domcontentloaded')
        for case in cases:
            result = await page.evaluate('async text => { const m = await import("/src/lib/match-topics.functions.ts"); return m.match_topics({data:{text}}); }', case['text'])
            results.append(result)
            if not result.get('ok'):
                break
        await browser.close()
    print(json.dumps(results))
asyncio.run(main())
`;
    const { stdout } = await promisify(execFile)("python3", ["-c", script], { timeout: 580000, maxBuffer: 1024 * 1024 });
    const results = JSON.parse(stdout.trim()) as MatchTopicsResult[];
    const failedCases: number[] = [];
    for (const [index, result] of results.entries()) {
      const fixture = fixtures[index];
      if (!fixture) throw new Error("Unexpected sorter result");
      expect(result.ok, `case ${index + 1}: ${result.reason ?? "unavailable"}`).toBe(true);
      if (fixture.expect.length && !fixture.expect.some((topic) => result.matches.includes(topic))) failedCases.push(index + 1);
      expect(result.crisis, `case ${index + 1}`).toBe(fixture.crisis);
    }
    expect(results.length).toBe(32);
    expect(failedCases, "Expected topic missing in numbered cases").toEqual([]);
  }, 590000);
});