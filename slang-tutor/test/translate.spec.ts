import { describe, it, expect } from 'vitest';
import OfflineDictionaryTranslator from '../src/lib/translate';

describe('OfflineDictionaryTranslator', () => {
  const tr = new OfflineDictionaryTranslator();
  it('translates slang->formal with breakdown', async () => {
    const { output, breakdown } = await tr.translate('no cap, that song is a banger', 'slang->formal', { decodeEmoji: true, decodeAcronyms: true });
    expect(output.toLowerCase()).toContain('no lie');
    expect(output.toLowerCase()).toContain('excellent song');
    expect(Array.isArray(breakdown)).toBe(true);
    expect(breakdown!.some(x => x.term.toLowerCase() === 'no cap')).toBe(true);
  });
  it('formal->slang is deterministic', async () => {
    const { output } = await tr.translate('excellent song', 'formal->slang');
    expect(output.toLowerCase()).toContain('banger');
  });
});
