export function nextDepth(current: number): 1 | 2 | 3 | null {
  return current === 0 ? 1 : current === 1 ? 2 : current === 2 ? 3 : null;
}