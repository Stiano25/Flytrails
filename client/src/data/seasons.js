/**
 * Kenya travel hints by month (0 = January), shown on the trip finder's month tiles.
 * Dry season: Jan–Feb and Jun–Oct. The Mara migration: Jul–Oct.
 */
export const seasonHint = (monthIndex) => {
  if (monthIndex >= 6 && monthIndex <= 9) return { label: 'Migration', tone: 'peak' };
  if (monthIndex <= 1 || monthIndex === 5) return { label: 'Dry season', tone: 'dry' };
  return null;
};
