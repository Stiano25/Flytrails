// Shared utility functions
export function formatKes(n) {
  return new Intl.NumberFormat('en-KE', { 
    style: 'currency', 
    currency: 'KES', 
    maximumFractionDigits: 0 
  }).format(n);
}

export function truncate(s, n = 380) {
  if (s.length <= n) return s;
  return `${s.slice(0, n).trim()}…`;
}

export function parseDurationDays(durationStr) {
  const m = durationStr.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

export function durationBucket(days) {
  if (days <= 2) return '1-2';
  if (days <= 5) return '3-5';
  return '6+';
}

export function matchesBudget(price, key) {
  if (!key) return true;
  if (key === 'under10k') return price < 10000;
  if (key === '10k-30k') return price >= 10000 && price <= 30000;
  if (key === '30k+') return price > 30000;
  return true;
}