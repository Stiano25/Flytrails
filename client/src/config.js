import { localImages } from './data/localImages.js';

export const SITE_ORIGIN = (import.meta.env.VITE_PUBLIC_SITE_URL || '').replace(/\/$/, '');

export const WHATSAPP_NUMBER = '254113714222';
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
export const SITE_PHONE_DISPLAY = '0113714222';
export const SITE_EMAIL = 'info@flytrailstravels.com';

export const CONTACT_LOCATION_IMAGE = localImages.savannah;
export const GOOGLE_MAPS_LOCATION_URL =
  'https://www.google.com/maps/search/?api=1&query=Nairobi%2C+Kenya';
