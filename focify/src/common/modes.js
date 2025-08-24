export const MODES = /** @type {const} */ ({ OFF: "off", WORK: "work" });
export function cycleMode(current) {
  return current === MODES.OFF ? MODES.WORK : MODES.OFF;
}
