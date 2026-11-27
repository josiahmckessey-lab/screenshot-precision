import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ from: vi.fn(), select: vi.fn(), eq: vi.fn(), single: vi.fn() }));
vi.mock("@tanstack/react-start", () => ({ createServerFn: () => {
  let validate = (input: unknown): unknown => input;
  const builder = {
    inputValidator: (validator: (input: unknown) => unknown) => { validate = validator; return builder; },
    handler: (handler: (input: { data: unknown }) => unknown) => (input?: { data: unknown }) => handler({ data: validate(input?.data) }),
  };
  return builder;
} }));
vi.mock("@/lib/match-topics.server", () => ({
  askTopicModel: vi.fn(),
  createPublicReadClient: () => ({ from: mocks.from }),
}));
import { getKeptTopic } from "@/lib/match-topics.functions";

beforeEach(() => {
  vi.clearAllMocks();
  const query = { select: mocks.select, eq: mocks.eq, maybeSingle: mocks.single };
  mocks.from.mockReturnValue(query);
  mocks.select.mockReturnValue(query);
  mocks.eq.mockReturnValue(query);
});

describe("Public kept topic read", () => {
  it("reads only stored try text for the active topic slug", async () => {
    mocks.single.mockResolvedValue({ data: { try_text: "Stored practice" }, error: null });
    expect(await getKeptTopic({ data: { slug: "topic-10" } })).toEqual({ try_text: "Stored practice" });
    expect(mocks.from).toHaveBeenCalledWith("library_pages");
    expect(mocks.select).toHaveBeenCalledWith("try_text");
    expect(mocks.eq.mock.calls).toEqual([["slug", "topic-10"], ["status", "active"]]);
  });
  it("returns no content when the active topic is absent", async () => {
    mocks.single.mockResolvedValue({ data: null, error: null });
    expect(await getKeptTopic({ data: { slug: "topic-10" } })).toBeNull();
  });
  it("rejects invalid slug input without reading the library", async () => {
    expect(await getKeptTopic({ data: { slug: "../private" } })).toBeNull();
    expect(mocks.from).not.toHaveBeenCalled();
  });
});