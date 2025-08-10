import slangEntries from "../slang/slang.json";
import emojiMap from "../slang/emoji.json";
import acronyms from "../slang/acronyms.json";
import { decodeEmoji as decodeEmojiText } from "./emoji";
import { decodeAcronyms as decodeAcronymsText } from "./acronyms";

export function normalize(text: string): string {
  return (text ?? "").normalize("NFC").toLowerCase().replace(/\s+/g, " ").trim();
}

// Tokenization preserving punctuation/spaces and recognizing emoji from our dictionary
export type TokenType = "word" | "space" | "punct" | "emoji";
export interface Token { type: TokenType; text: string; start: number; end: number }

const WORD_RE = /[\p{L}0-9]+(?:[.;:'-][\p{L}0-9]+)*/u;

function buildEmojiKeys(): string[] {
  return Object.keys(emojiMap).sort((a, b) => [...b].length - [...a].length);
}
const EMOJI_KEYS = buildEmojiKeys();

export function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < text.length) {
    // Emoji match first (keys sorted by longest)
    let matchedEmoji = false;
    for (const k of EMOJI_KEYS) {
      if (text.startsWith(k, i)) {
        tokens.push({ type: "emoji", text: k, start: i, end: i + k.length });
        i += k.length;
        matchedEmoji = true;
        break;
      }
    }
    if (matchedEmoji) continue;

    const ch = text[i];
    if (/\s/.test(ch)) {
      let j = i + 1;
      while (j < text.length && /\s/.test(text[j])) j++;
      tokens.push({ type: "space", text: text.slice(i, j), start: i, end: j });
      i = j;
      continue;
    }
    const wordMatch = text.slice(i).match(WORD_RE);
    if (wordMatch && wordMatch.index === 0) {
      const word = wordMatch[0];
      tokens.push({ type: "word", text: word, start: i, end: i + word.length });
      i += word.length;
      continue;
    }
    // Punctuation fallback (single char)
    tokens.push({ type: "punct", text: ch, start: i, end: i + 1 });
    i += 1;
  }
  return tokens;
}

// Build slang index for longest multi-word matching
interface SlangEntry { term: string; meaning: string }
const SLANG: SlangEntry[] = slangEntries as SlangEntry[];

const firstWordMap = new Map<string, string[][]>(); // firstWord -> list of terms split
let maxTermLen = 1;
for (const e of SLANG) {
  const words = normalize(e.term).split(" ");
  if (!firstWordMap.has(words[0])) firstWordMap.set(words[0], []);
  firstWordMap.get(words[0])!.push(words);
  if (words.length > maxTermLen) maxTermLen = words.length;
}

// Reverse map meaning -> term (pick first occurrence) for toSlang
// Split meanings on semicolons and common separators to allow matching sub-phrases like "excellent song"
const meaningTerms = SLANG.reduce((acc, e) => {
  const parts = e.meaning
    .split(/;|,|\(|\)|\bor\b|\band\b/gi)
    .map(s => normalize(s))
    .map(s => s.replace(/\b(esp\.|especially)\b/g, "").trim())
    .filter(Boolean);
  if (parts.length === 0) parts.push(normalize(e.meaning));
  for (const key of parts) {
    if (!acc.has(key)) acc.set(key, e.term);
  }
  return acc;
}, new Map<string, string>());

function wordTokenIndices(tokens: Token[]): number[] {
  const idxs: number[] = [];
  tokens.forEach((t, i) => t.type === "word" && idxs.push(i));
  return idxs;
}

function tryMatchSlangAt(tokens: Token[], wordIdxs: number[], iWord: number): { len: number; entry?: SlangEntry } {
  const iTok = wordIdxs[iWord];
  const first = normalize(tokens[iTok].text);
  const candidates = firstWordMap.get(first);
  if (!candidates) return { len: 0 };
  let bestLen = 0;
  let bestEntry: SlangEntry | undefined;
  // Try candidates; prefer longer
  for (const cand of candidates) {
    const L = cand.length;
    // collect next L words
    if (iWord + L - 1 >= wordIdxs.length) continue;
    let ok = true;
    for (let k = 0; k < L; k++) {
      const tok = tokens[wordIdxs[iWord + k]];
      if (normalize(tok.text) !== cand[k]) { ok = false; break; }
    }
    if (ok && L > bestLen) {
      bestLen = L;
      const term = cand.join(" ");
      const found = SLANG.find(s => normalize(s.term) === term);
      if (found) bestEntry = found;
    }
  }
  return { len: bestLen, entry: bestEntry };
}

export function toFormal(text: string, opts?: { decodeEmoji?: boolean; decodeAcronyms?: boolean }): string {
  const tokens = tokenize(text);
  const result: string[] = [];
  const wIdxs = wordTokenIndices(tokens);
  let iWord = 0;
  let iTok = 0;
  while (iTok < tokens.length) {
    const t = tokens[iTok];
    if (t.type === "word") {
      const { len, entry } = tryMatchSlangAt(tokens, wIdxs, iWord);
      if (len > 0 && entry) {
        result.push(entry.meaning);
        // skip over L words, but also skip the non-word tokens between them? We already output once; Now advance to the token after the last matched word
        const lastWordTokenIndex = wIdxs[iWord + len - 1];
        // move iTok to lastWordTokenIndex, then increment; but we must also skip any punctuation/spaces in between are not included in output here, but they should remain — So append intervening punctuation/spaces as they occurred between matched words? For replacement, we typically replace the whole phrase contiguous across words, preserving surrounding punctuation outside the phrase. Inside words, any spaces/punct are part of tokens between matched words; for replacement, we shouldn't duplicate them.
        // We need to drop intra-phrase spaces/punct. So we will set iTok to lastWordTokenIndex + 1 and then fast-forward over any spaces/punct that are between the matched words only if they are between words; but those were between words, so they should be removed in replacement. We will just jump iTok to lastWordTokenIndex + 1. The next loop iteration will proceed from there.
        iTok = lastWordTokenIndex + 1;
        iWord += len;
        continue;
      } else {
        // possibly acronym
        if (opts?.decodeAcronyms) {
          const key = normalize(t.text);
          const exp = (acronyms as Record<string, string>)[Object.keys(acronyms).find(k => k.toLowerCase() === key) as string];
          if (exp) {
            result.push(exp);
          } else {
            result.push(t.text);
          }
        } else {
          result.push(t.text);
        }
        iTok++;
        iWord++;
        continue;
      }
    } else if (t.type === "emoji") {
      if (opts?.decodeEmoji) {
        result.push((emojiMap as Record<string, string>)[t.text] ?? t.text);
      } else {
        result.push(t.text);
      }
      iTok++;
      continue;
    } else {
      // space or punct
      result.push(t.text);
      iTok++;
      continue;
    }
  }
  // After full pass, if decodeEmoji/decodeAcronyms requested for the rest (outside matches), we already handled above.
  return result.join("");
}

// Reverse mapping: try replacing meanings back to slang terms using longest-match over meaning words
export function toSlang(text: string): string {
  const tokens = tokenize(text);
  const result: string[] = [];
  const wIdxs = wordTokenIndices(tokens);
  // Build meaning words index lazily
  const byFirst = new Map<string, string[][]>(); // first word -> array of meaning word arrays
  let maxLen = 1;
  for (const [meaning, term] of meaningTerms) {
    const words = normalize(meaning).split(" ");
    if (!byFirst.has(words[0])) byFirst.set(words[0], []);
    byFirst.get(words[0])!.push(words);
    if (words.length > maxLen) maxLen = words.length;
  }
  let iWord = 0;
  let iTok = 0;
  while (iTok < tokens.length) {
    const t = tokens[iTok];
    if (t.type === "word") {
      const first = normalize(t.text);
      const cands = byFirst.get(first) || [];
      let bestLen = 0;
      let bestTerm: string | undefined;
      for (const c of cands) {
        const L = c.length;
        if (iWord + L - 1 >= wIdxs.length) continue;
        let ok = true;
        for (let k = 0; k < L; k++) {
          const tok = tokens[wIdxs[iWord + k]];
          if (normalize(tok.text) !== c[k]) { ok = false; break; }
        }
        if (ok && L > bestLen) {
          bestLen = L;
          const m = c.join(" ");
          bestTerm = meaningTerms.get(m);
        }
      }
      if (bestLen > 0 && bestTerm) {
        result.push(bestTerm);
        const lastWordTokenIndex = wIdxs[iWord + bestLen - 1];
        iTok = lastWordTokenIndex + 1;
        iWord += bestLen;
        continue;
      } else {
        result.push(t.text);
        iTok++; iWord++;
        continue;
      }
    } else {
      result.push(t.text);
      iTok++;
    }
  }
  return result.join("");
}

export function explainBreakdown(text: string): Array<{ term: string; meaning: string; type: "slang"|"emoji"|"acronym"; start: number; end: number }> {
  const tokens = tokenize(text);
  const res: Array<{ term: string; meaning: string; type: "slang"|"emoji"|"acronym"; start: number; end: number }> = [];
  const wIdxs = wordTokenIndices(tokens);
  let iWord = 0;
  for (let iTok = 0; iTok < tokens.length; iTok++) {
    const t = tokens[iTok];
    if (t.type === "word") {
      const { len, entry } = tryMatchSlangAt(tokens, wIdxs, iWord);
      if (len > 0 && entry) {
        const start = tokens[wIdxs[iWord]].start;
        const end = tokens[wIdxs[iWord + len - 1]].end;
        res.push({ term: entry.term, meaning: entry.meaning, type: "slang", start, end });
        iTok = wIdxs[iWord + len - 1];
        iWord += len;
        continue;
      }
      // acronym check
      const key = Object.keys(acronyms).find(k => k.toLowerCase() === normalize(t.text));
      if (key) {
        const meaning = (acronyms as Record<string, string>)[key];
        res.push({ term: key, meaning, type: "acronym", start: t.start, end: t.end });
      }
      iWord++;
    } else if (t.type === "emoji") {
      const meaning = (emojiMap as Record<string, string>)[t.text];
      if (meaning) res.push({ term: t.text, meaning, type: "emoji", start: t.start, end: t.end });
    }
  }
  return res;
}
