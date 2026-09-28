/**
 * Minimal, dependency-free counter for the home trip finder, so its use can be measured later.
 * Each call bumps an in-memory count and fires a `flytrails:finder` window event that any
 * analytics tool can listen for. Nothing is sent anywhere and nothing is logged.
 *
 * Steps: 'open:type' | 'open:when' | 'open:who' | 'choose:type' | 'choose:when' | 'choose:who' | 'submit' | 'explore'
 */
const counts = {};

export function trackFinder(step, detail = {}) {
  counts[step] = (counts[step] || 0) + 1;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('flytrails:finder', { detail: { step, count: counts[step], ...detail } }));
  }
}

export const finderCounts = () => ({ ...counts });
