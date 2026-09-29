/**
 * Open WhatsApp with a message ready to send. Opened straight from the click so pop-up blockers allow it;
 * if a new tab is refused anyway, go there in this tab. (No 'noopener' feature: with it window.open
 * always returns null, so the opener link is cut by hand instead.)
 */
export function openWhatsapp(href, message) {
  const url = `${href}?text=${encodeURIComponent(message)}`;
  const win = window.open(url, '_blank');
  if (win) win.opener = null;
  else window.location.href = url;
}
