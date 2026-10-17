const DAY_MAP = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday'
};

export function getCurrentDayKey(date = new Date()) {
  return DAY_MAP[date.getDay()] || 'sunday';
}
