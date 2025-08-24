export const MODES = /** @type {const} */ ({ OFF: "off", WORK: "work", STRICT: "strict" });
export function cycleMode(current) {
  return current === MODES.OFF ? MODES.WORK : current === MODES.WORK ? MODES.STRICT : MODES.OFF;
}
