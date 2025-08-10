import { toFormal, toSlang, explainBreakdown } from "./slang";
import { USE_OPTIONAL_API } from "../config";

export type Mode = "slang->formal" | "formal->slang";

export interface Translator {
  translate(text: string, mode: Mode, opts?: Record<string, any>): Promise<{ output: string; breakdown?: any[] }>
}

export class OfflineDictionaryTranslator implements Translator {
  async translate(text: string, mode: Mode, opts?: { decodeEmoji?: boolean; decodeAcronyms?: boolean }) {
    if (mode === "slang->formal") {
      const output = toFormal(text, opts);
      const breakdown = explainBreakdown(text);
      return { output, breakdown };
    }
    const output = toSlang(text);
    return { output };
  }
}

export class OptionalApiProvider implements Translator {
  async translate(text: string, mode: Mode, opts?: any) {
    if (!USE_OPTIONAL_API) {
      return Promise.reject(new Error("Optional API disabled (USE_OPTIONAL_API=false)"));
    }
    // Stub: wire your API call here.
    // This is intentionally left unimplemented and must not make network calls when disabled.
    return Promise.resolve({ output: text });
  }
}

export default OfflineDictionaryTranslator;
