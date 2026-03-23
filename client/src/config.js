import { localImages } from './data/localImages.js';

/**
 * Optional: set `VITE_PUBLIC_SITE_URL` in `.env.development` to your ngrok URL (no trailing slash).
 * Used for absolute URLs when needed; when unset, the app uses `window.location.origin`.
 */
export const SITE_ORIGIN = (import.meta.env.VITE_PUBLIC_SITE_URL || '').replace(/\/$/, '');

/** Replace with your real WhatsApp number (digits only after country code) */
export const WHATSAPP_NUMBER = '254712345678';
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
export const SITE_PHONE_DISPLAY = '+254 712 345 678';
export const SITE_EMAIL = 'hello@flytrails.com';

/** Local image — Contact page location visual. Opens Google Maps in a new tab. */
export const CONTACT_LOCATION_IMAGE = localImages.savannah;
export const GOOGLE_MAPS_LOCATION_URL =
  'https://www.google.com/maps/search/?api=1&query=Nairobi%2C+Kenya';
