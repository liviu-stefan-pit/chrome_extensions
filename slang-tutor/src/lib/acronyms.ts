import acronyms from "../slang/acronyms.json";

// Expand known acronyms. Case-insensitive; preserves original case for pass-through.
export function decodeAcronyms(text: string): string {
  if (!text) return text;
  const map = new Map<string, string>(Object.entries(acronyms).map(([k, v]) => [k.toLowerCase(), v]));
  return text.replace(/\b[\p{L}0-9][\p{L}0-9.;:'-]*\b/gu, (tok) => {
    const key = tok.toLowerCase();
    return map.get(key) ?? tok;
  });
}
