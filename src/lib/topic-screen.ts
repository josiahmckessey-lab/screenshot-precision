export function validateTopicSearch(search: Record<string, unknown>) {
  const value = Number(search["read"]);
  const read = Number.isFinite(value) ? Math.max(0, Math.min(3, Math.trunc(value))) : 0;
  const flag = (key: string) => search[key] === true || search[key] === "true";
  return {
    read, chooser: flag("chooser"), fits: flag("fits"), all: flag("all"),
    words: flag("words"), scripture: flag("scripture"), verses: flag("verses"),
    ...(typeof search["from"] === "string" ? { from: search["from"] } : {}),
  };
}

export function readingLane(read: number, deeper: boolean, fits: boolean, chooser: boolean) {
  const depth = chooser ? Math.max(1, read) : read;
  return { depth, showFit: deeper && (depth === 1 || chooser), canRead: depth < 3 && (!deeper || depth !== 1 || fits) && !chooser };
}