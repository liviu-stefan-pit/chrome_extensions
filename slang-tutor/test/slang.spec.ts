import { describe, it, expect } from 'vitest';
import { normalize, toFormal, toSlang, explainBreakdown } from '../src/lib/slang';

describe('normalize', () => {
  it('lowercases and collapses whitespace', () => {
    expect(normalize('  No   Cap  ')).toBe('no cap');
  });
});

describe('longest multi-word match', () => {
  it('prefers longest phrase over sub-phrase', () => {
    const input = 'That track is lowkey fire, no cap.';
    const out = toFormal(input);
    expect(out).toContain('surprisingly very good'); // lowkey fire
    expect(out).toContain('no lie'); // no cap
  });
});

describe('punctuation safety', () => {
  it('handles trailing punctuation', () => {
    const input = 'Spill the tea!';
    const out = toFormal(input);
    expect(out).toContain('share the gossip');
    expect(out.endsWith('!')).toBe(true);
  });
});

describe('round trip', () => {
  it('formal -> slang -> formal yields stable meaning for known terms', () => {
    const input = 'This is surprisingly very good.'; // meaning for "lowkey fire"
    const slang = toSlang(input);
    const back = toFormal(slang);
    expect(back.toLowerCase()).toContain('surprisingly very good');
  });
});

describe('breakdown', () => {
  it('includes start/end with types', () => {
    const input = 'no cap 😂 TL;DR';
    const b = explainBreakdown(input);
    const kinds = b.map(x => x.type).sort();
    expect(kinds).toEqual(['acronym','emoji','slang']);
    const slang = b.find(x => x.type==='slang')!;
    expect(input.slice(slang.start, slang.end).toLowerCase()).toBe('no cap');
  });
});
