/**
 * Kenya travel seasons by month (0 = January), used by the trip finder's month picker.
 * A rough guide: dry Jan–Feb and Jun–Oct (with the Mara migration Jul–Oct),
 * long rains Mar–May, short rains Nov–Dec.
 */
export const SEASONS = {
  dry: { label: 'Dry season', image: '/images/seasons/dry.jpg', strip: 'bg-amber-400' },
  longRains: { label: 'Long rains', image: '/images/seasons/long-rains.jpg', strip: 'bg-emerald-500' },
  migration: { label: 'Migration', image: '/images/seasons/migration.jpg', strip: 'bg-accent' },
  shortRains: { label: 'Short rains', image: '/images/seasons/short-rains.jpg', strip: 'bg-sky-500' },
};

const BY_MONTH = ['dry', 'dry', 'longRains', 'longRains', 'longRains', 'dry', 'migration', 'migration', 'migration', 'migration', 'shortRains', 'shortRains'];

export const seasonFor = (monthIndex) => ({ key: BY_MONTH[monthIndex], ...SEASONS[BY_MONTH[monthIndex]] });

/** Months (0-11) that usually suit each trip type best; used to flag "Good time" on month tiles. */
export const BEST_MONTHS = {
  safari: [0, 1, 5, 6, 7, 8, 9],
  hiking: [0, 1, 6, 7, 8, 9],
  beach: [0, 1, 2, 6, 7, 8, 9, 11],
  camping: [0, 1, 5, 6, 7, 8, 9],
  honeymoon: [0, 1, 5, 6, 7, 8, 9, 11],
  family: [3, 7, 11],
};
