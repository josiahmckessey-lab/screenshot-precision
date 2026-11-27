export const WALK_KEY = "gift-walk-v1";
export const WALK_STEPS = 20;

function validStep(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= WALK_STEPS;
}

export function readWalkStep(storage?: Storage): number | null {
  try {
    const value: unknown = JSON.parse((storage ?? localStorage).getItem(WALK_KEY) ?? "null");
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const item = value as Record<string, unknown>;
    return Object.keys(item).length === 1 && validStep(item["step"]) ? item["step"] : null;
  } catch { return null; }
}

export function saveWalkStep(step: number, storage?: Storage): boolean {
  try {
    if (!validStep(step)) return false;
    (storage ?? localStorage).setItem(WALK_KEY, JSON.stringify({ step }));
    return true;
  } catch { return false; }
}

export function clearWalkStep(storage?: Storage): boolean {
  try { (storage ?? localStorage).removeItem(WALK_KEY); return true; }
  catch { return false; }
}

export function validateWalkSearch(search: Record<string, unknown>): { step?: number; done?: true } {
  const raw = search["step"];
  const step = typeof raw === "string" && /^\d{1,2}$/.test(raw) ? Number(raw) : raw;
  return {
    ...(validStep(step) ? { step } : {}),
    ...(search["done"] === true || search["done"] === "true" ? { done: true as const } : {}),
  };
}
