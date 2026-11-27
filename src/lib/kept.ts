export const KEPT_KEY = "gift-kept-v1";
export const MIN_WAIT_MS = 3600000;
export type KeptItem = { slug: string; title: string; at: number };

function validItem(value: unknown): value is KeptItem {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  return Object.keys(item).length === 3 &&
    typeof item["slug"] === "string" && item["slug"].length <= 128 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item["slug"]) &&
    typeof item["title"] === "string" && item["title"].trim().length > 0 && item["title"].length <= 500 &&
    typeof item["at"] === "number" && Number.isSafeInteger(item["at"]) && item["at"] >= 0 && item["at"] <= Date.now();
}

export function readKept(storage?: Storage): KeptItem | null {
  try {
    const value: unknown = JSON.parse((storage ?? localStorage).getItem(KEPT_KEY) ?? "null");
    return validItem(value) ? value : null;
  } catch { return null; }
}

export function saveKept(item: KeptItem, storage?: Storage): boolean {
  try {
    if (!validItem(item)) return false;
    (storage ?? localStorage).setItem(KEPT_KEY, JSON.stringify({ slug: item.slug, title: item.title, at: item.at }));
    return true;
  } catch { return false; }
}

export function clearKept(storage?: Storage): boolean {
  try { (storage ?? localStorage).removeItem(KEPT_KEY); return true; }
  catch { return false; }
}

export function isKeptReady(item: KeptItem, now = Date.now()): boolean {
  return Number.isFinite(now) && now - item.at >= MIN_WAIT_MS;
}