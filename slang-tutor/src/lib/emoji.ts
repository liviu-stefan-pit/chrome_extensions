import emojiMap from "../slang/emoji.json";

// Replace emoji graphemes with their meanings, preserving other text.
export function decodeEmoji(text: string): string {
  if (!text) return text;
  // Keys sorted by length desc to match multi-codepoint sequences first
  const keys = Object.keys(emojiMap).sort((a, b) => [...b].length - [...a].length);
  let out = "";
  for (let i = 0; i < text.length; ) {
    let matched = false;
    for (const k of keys) {
      if (text.startsWith(k, i)) {
        out += (emojiMap as Record<string, string>)[k];
        i += k.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      out += text[i];
      i += 1;
    }
  }
  return out;
}
