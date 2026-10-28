/**
 * Convert common Kenyan and international input formats to a WhatsApp wa.me number.
 * The returned value contains digits only, including the country code.
 */
export function normalizeWhatsAppNumber(value, defaultCountryCode = '254') {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const digits = raw.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) return digits.slice(1).replace(/\D/g, '');
  if (digits.startsWith('00')) return digits.slice(2).replace(/\D/g, '');
  const clean = digits.replace(/\D/g, '');
  if (clean.startsWith(defaultCountryCode)) return clean;
  if (clean.startsWith('0')) return `${defaultCountryCode}${clean.slice(1)}`;
  return `${defaultCountryCode}${clean}`;
}
