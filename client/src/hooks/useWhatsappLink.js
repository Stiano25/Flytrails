import { WHATSAPP_URL } from '../config.js';
import { useSiteContent } from './useApi.js';

export function useWhatsappLink() {
  const { data: content } = useSiteContent();
  const whatsappNum = content?.contact_whatsapp;
  const whatsappHref = whatsappNum ? `https://wa.me/${whatsappNum}` : WHATSAPP_URL;
  return whatsappHref;
}
