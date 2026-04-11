const CONTACT_TO_DEFAULT = 'info@flytrailstravels.com';

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function clamp(str, max) {
  const t = String(str || '').trim();
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

/**
 * Sends a contact form message to the support inbox via Resend.
 * @returns {{ ok: true }} | {{ ok: false, status: number, error: string }}
 */
export async function sendContactMail({ name, email, phone, subject, message }) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = (process.env.CONTACT_MAIL_TO || CONTACT_TO_DEFAULT).trim();
  const from = (process.env.CONTACT_MAIL_FROM || 'Flytrails Website <onboarding@resend.dev>').trim();

  if (!apiKey) {
    console.error('[contact] RESEND_API_KEY is not set; cannot send email.');
    return { ok: false, status: 503, error: 'Email delivery is not configured on the server.' };
  }

  const safeName = clamp(name, 120);
  const safeEmail = clamp(email, 254);
  const safePhone = clamp(phone, 40);
  const safeSubject = clamp(subject, 200);
  const safeMessage = clamp(message, 8000);

  const text = [
    `Name: ${safeName}`,
    `Email: ${safeEmail}`,
    safePhone ? `Phone: ${safePhone}` : null,
    '',
    safeMessage,
  ]
    .filter(Boolean)
    .join('\n');

  const html = `
    <p><strong>Name:</strong> ${escapeHtml(safeName)}</p>
    <p><strong>Email:</strong> ${escapeHtml(safeEmail)}</p>
    ${safePhone ? `<p><strong>Phone:</strong> ${escapeHtml(safePhone)}</p>` : ''}
    <hr />
    <pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(safeMessage)}</pre>
  `.trim();

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: safeEmail,
      subject: `Website contact: ${safeSubject}`,
      text,
      html,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errMsg = data?.message || data?.error || res.statusText || 'Email provider rejected the request';
    console.error('[contact] Resend error:', res.status, errMsg);
    return { ok: false, status: 502, error: 'Could not send your message. Please try again later or email us directly.' };
  }

  return { ok: true };
}
