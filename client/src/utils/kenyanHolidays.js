const pad = (value) => String(value).padStart(2, '0');
const isoDate = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

function easterSunday(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function shiftDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Returns recurring Kenyan public holidays whose dates can be calculated
 * without lunar observation. Eid and Diwali dates remain annual overrides.
 */
export function getKenyanHolidays(year) {
  const easter = easterSunday(year);
  return [
    { date: `${year}-01-01`, name: "New Year's Day" },
    { date: isoDate(shiftDays(easter, -2)), name: 'Good Friday' },
    { date: isoDate(shiftDays(easter, 1)), name: 'Easter Monday' },
    { date: `${year}-05-01`, name: 'Labour Day' },
    { date: `${year}-06-01`, name: 'Madaraka Day' },
    { date: `${year}-10-10`, name: 'Mazingira Day' },
    { date: `${year}-10-20`, name: 'Mashujaa Day' },
    { date: `${year}-12-12`, name: 'Jamhuri Day' },
    { date: `${year}-12-25`, name: 'Christmas Day' },
    { date: `${year}-12-26`, name: 'Boxing Day' },
  ];
}

export function isKenyanPublicHoliday(value, annualOverrides = []) {
  const date = String(value || '').slice(0, 10);
  if (!date) return false;
  const year = Number(date.slice(0, 4));
  return getKenyanHolidays(year).some((holiday) => holiday.date === date) || annualOverrides.includes(date);
}
