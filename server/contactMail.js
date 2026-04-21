import nodemailer from 'nodemailer';

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
 * Sends a contact form message to the support inbox via Zoho SMTP using Nodemailer.
 * @returns {{ ok: true }} | {{ ok: false, status: number, error: string }}
 */
export async function sendContactMail({ name, email, phone, subject, message }) {
  const zohoEmail = process.env.ZOHO_EMAIL;
  const zohoPassword = process.env.ZOHO_APP_PASSWORD;
  const to = (process.env.CONTACT_MAIL_TO || CONTACT_TO_DEFAULT).trim();

  if (!zohoEmail || !zohoPassword || zohoPassword === 'your_zoho_app_password') {
    console.error('[contact] ZOHO_EMAIL or ZOHO_APP_PASSWORD is not set; cannot send email.');
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

  const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.com', 
    port: 465,
    secure: true, 
    auth: {
      user: zohoEmail,
      pass: zohoPassword,
    },
  });

  try {
    await transporter.sendMail({
      from: `"Flytrails Website" <${zohoEmail}>`, 
      to,
      replyTo: safeEmail,
      subject: `Website contact: ${safeSubject}`,
      text,
      html,
    });
    return { ok: true };
  } catch (error) {
    console.error('[contact] Nodemailer error:', error);
    return { ok: false, status: 502, error: 'Could not send your message. Please try again later or email us directly.' };
  }
}
