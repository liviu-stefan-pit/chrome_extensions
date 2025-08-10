import slang from "../slang/slang.json";

export interface SlangEntry { term: string; meaning: string }

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function hashString(s: string): number {
  let h = 2166136261 >>> 0; // FNV-1a base
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function slangOfTheDay(date: Date = new Date()): SlangEntry {
  const key = dateKey(date);
  const h = hashString(key);
  const idx = slang.length ? h % slang.length : 0;
  return slang[idx] as SlangEntry;
}
