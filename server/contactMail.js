import { Resend } from 'resend';

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
  const from = process.env.RESEND_FROM || 'Flytrails <onboarding@resend.dev>';
  const to = (
    process.env.ADMIN_NOTIFICATION_EMAIL ||
    process.env.CONTACT_MAIL_TO ||
    CONTACT_TO_DEFAULT
  ).trim();

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
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
      <h2 style="color: #0f172a; margin-bottom: 16px; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px;">New Contact Form Message</h2>
      <p style="margin: 6px 0;"><strong>Name:</strong> ${escapeHtml(safeName)}</p>
      <p style="margin: 6px 0;"><strong>Email:</strong> <a href="mailto:${escapeHtml(safeEmail)}" style="color: #ea580c;">${escapeHtml(safeEmail)}</a></p>
      ${safePhone ? `<p style="margin: 6px 0;"><strong>Phone:</strong> ${escapeHtml(safePhone)}</p>` : ''}
      <div style="margin-top: 20px; padding: 16px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #ea580c;">
        <p style="margin: 0; font-weight: 600; color: #475569; font-size: 13px; text-transform: uppercase;">Message:</p>
        <p style="margin-top: 8px; white-space: pre-wrap; line-height: 1.6;">${escapeHtml(safeMessage)}</p>
      </div>
    </div>
  `.trim();

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: safeEmail,
      subject: `Website contact: ${safeSubject}`,
      text,
      html,
    });

    if (error) {
      console.error('[contact] Resend API error:', error);
      return { ok: false, status: 502, error: error.message || 'Could not send your message.' };
    }

    return { ok: true };
  } catch (error) {
    console.error('[contact] Resend error:', error);
    return { ok: false, status: 502, error: 'Could not send your message. Please try again later or email us directly.' };
  }
}
