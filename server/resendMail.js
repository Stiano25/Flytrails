import { Resend } from 'resend';

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatKES(val) {
  const num = Number(val) || 0;
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Sends a booking confirmation email with ticket details to the customer.
 */
export async function sendBookingConfirmation(booking) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[resendMail] RESEND_API_KEY missing; skipping customer confirmation email.');
    return { ok: false, error: 'RESEND_API_KEY not configured' };
  }

  const from = process.env.RESEND_FROM || 'Flytrailstravels <no-reply@info.flytrailstravels.com>';
  const resend = new Resend(apiKey);

  const formattedAmount = formatKES(booking.amount);
  const departureText = booking.trip_departure ? escapeHtml(booking.trip_departure) : 'To be communicated';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Booking Confirmed - Flytrailstravels</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 32px 16px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
              <!-- Header -->
              <tr>
                <td style="background-color: #0f172a; padding: 32px 28px; text-align: center;">
                  <h1 style="color: #f97316; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">FLYTRAILSTRAVELS</h1>
                  <p style="color: #94a3b8; margin: 6px 0 0; font-size: 14px;">Your Adventure is Confirmed!</p>
                </td>
              </tr>

              <!-- Ticket Badge -->
              <tr>
                <td style="padding: 28px 28px 12px; text-align: center;">
                  <div style="display: inline-block; background-color: #fff7ed; border: 2px dashed #f97316; border-radius: 12px; padding: 12px 24px;">
                    <span style="display: block; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; color: #ea580c;">Ticket Number</span>
                    <span style="display: block; font-size: 22px; font-weight: 800; letter-spacing: 2px; color: #0f172a; margin-top: 2px;">${escapeHtml(booking.ticket_number)}</span>
                  </div>
                </td>
              </tr>

              <!-- Greeting -->
              <tr>
                <td style="padding: 12px 28px;">
                  <p style="font-size: 16px; line-height: 1.5; margin: 0 0 12px;">Hi <strong>${escapeHtml(booking.customer_name)}</strong>,</p>
                  <p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0;">
                    Thank you for booking with Flytrailstravels! We have received your payment via M-Pesa. Here are your booking and ticket details:
                  </p>
                </td>
              </tr>

              <!-- Details Box -->
              <tr>
                <td style="padding: 12px 28px 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; padding: 18px; border: 1px solid #e2e8f0;">
                    <tr>
                      <td style="padding: 6px 0; font-size: 14px; color: #64748b; width: 40%;">Trip</td>
                      <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 600;">${escapeHtml(booking.trip_title)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; font-size: 14px; color: #64748b;">Departure</td>
                      <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 600;">${departureText}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; font-size: 14px; color: #64748b;">Slots Reserved</td>
                      <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 600;">${escapeHtml(booking.slots)} slot(s)</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; font-size: 14px; color: #64748b;">Total Paid</td>
                      <td style="padding: 6px 0; font-size: 16px; color: #16a34a; font-weight: 700;">${formattedAmount}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; font-size: 14px; color: #64748b;">M-Pesa Receipt</td>
                      <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-family: monospace; font-weight: 600;">${escapeHtml(booking.mpesa_receipt || 'Confirmed')}</td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Instructions -->
              <tr>
                <td style="padding: 0 28px 28px;">
                  <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 14px 16px; border-radius: 6px;">
                    <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #1e40af;">
                      <strong>Note:</strong> Please save this email or keep your ticket number handy. Our team will reach out on WhatsApp/Phone (<a href="tel:${escapeHtml(booking.customer_phone)}" style="color: #1e40af;">${escapeHtml(booking.customer_phone)}</a>) with final departure details, meetup point and packing list.
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 28px; text-align: center;">
                  <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                    Flytrails Travels &bull; Nairobi, Kenya &bull; info@flytrailstravels.com
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `.trim();

  try {
    const { error } = await resend.emails.send({
      from,
      to: booking.customer_email,
      subject: `Booking Confirmed: ${booking.trip_title} (Ticket #${booking.ticket_number})`,
      html,
    });

    if (error) {
      console.error('[resendMail] Error sending customer email:', error.message);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err) {
    console.error('[resendMail] Exception sending customer email:', err);
    return { ok: false, error: err.message };
  }
}

/**
 * Sends a notification email to the admin whenever a new booking is completed.
 */
export async function sendAdminBookingAlert(booking) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[resendMail] RESEND_API_KEY missing; skipping admin notification email.');
    return { ok: false, error: 'RESEND_API_KEY not configured' };
  }

  const from = process.env.RESEND_FROM || 'Flytrails <no-reply@info.flytrailstravels.com>';
  const to = (process.env.ADMIN_NOTIFICATION_EMAIL || 'info@flytrailstravels.com').trim();
  const resend = new Resend(apiKey);

  const formattedAmount = formatKES(booking.amount);

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
      <h2 style="color: #0f172a; margin-bottom: 8px;">🎉 New Paid Booking Received!</h2>
      <p style="color: #64748b; margin-top: 0;">A customer has just completed payment via M-Pesa.</p>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-size: 14px; width: 35%;">Ticket Number:</td>
          <td style="padding: 6px 0; font-weight: 700; color: #0f172a; font-size: 15px;">${escapeHtml(booking.ticket_number)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Trip:</td>
          <td style="padding: 6px 0; font-weight: 600; color: #0f172a; font-size: 14px;">${escapeHtml(booking.trip_title)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Customer Name:</td>
          <td style="padding: 6px 0; font-weight: 600; color: #0f172a; font-size: 14px;">${escapeHtml(booking.customer_name)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Email:</td>
          <td style="padding: 6px 0; font-size: 14px;"><a href="mailto:${escapeHtml(booking.customer_email)}" style="color: #ea580c;">${escapeHtml(booking.customer_email)}</a></td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Phone:</td>
          <td style="padding: 6px 0; font-size: 14px;"><a href="tel:${escapeHtml(booking.customer_phone)}" style="color: #ea580c;">${escapeHtml(booking.customer_phone)}</a></td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Slots Booked:</td>
          <td style="padding: 6px 0; font-weight: 600; color: #0f172a; font-size: 14px;">${escapeHtml(booking.slots)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Total Amount:</td>
          <td style="padding: 6px 0; font-weight: 700; color: #16a34a; font-size: 16px;">${formattedAmount}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-size: 14px;">M-Pesa Receipt:</td>
          <td style="padding: 6px 0; font-family: monospace; font-weight: 600; color: #0f172a; font-size: 14px;">${escapeHtml(booking.mpesa_receipt || "N/A")}</td>
        </tr>
      </table>

      <p style="margin-top: 24px; font-size: 13px; color: #94a3b8; text-align: center;">
        View all bookings in the <a href="https://flytrailstravels.com/admin/bookings" style="color: #f97316;">Admin Dashboard &rarr;</a>
      </p>
    </div>
  `.trim()

  try {
    const { error } = await resend.emails.send({
      from,
      to,
      subject: `New Booking: ${booking.customer_name} - ${booking.trip_title} (${formattedAmount})`,
      html,
    });

    if (error) {
      console.warn('[resendMail] Error sending admin alert email:', error.message);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err) {
    console.error('[resendMail] Exception sending admin alert email:', err);
    return { ok: false, error: err.message };
  }
}

/**
 * Sends a short alert when a customer submits a Custom Trip request.
 */
export async function sendAdminCustomTripAlert(request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[resendMail] RESEND_API_KEY missing; skipping custom trip notification email.');
    return { ok: false, error: 'RESEND_API_KEY not configured' };
  }

  const from = process.env.RESEND_FROM || 'Flytrails <no-reply@info.flytrailstravels.com>';
  const to = (process.env.ADMIN_NOTIFICATION_EMAIL || 'info@flytrailstravels.com').trim();
  const siteOrigin = (process.env.PUBLIC_SITE_URL || 'https://flytrailstravels.com').replace(/\/$/, '');
  const adminUrl = `${siteOrigin}/admin/custom-trip-requests`;
  const resend = new Resend(apiKey);
  const details = [
    ['Reference', request.reference_number],
    ['Customer', request.customer_name],
    ['Email', request.customer_email],
    ['WhatsApp', request.customer_phone],
    ['Trip type', request.trip_type || 'Not specified'],
    ['Destination', request.destination || 'Not specified'],
    ['Travel dates', request.travel_dates || 'Not specified'],
    ['Travelers', `${request.adults} adult(s), ${request.children} child(ren)`],
    ['Budget', request.budget || 'Not specified'],
  ];
  const rows = details.map(([label, value]) => `
    <tr>
      <td style="padding: 7px 0; color: #64748b; font-size: 14px; width: 35%;">${escapeHtml(label)}</td>
      <td style="padding: 7px 0; color: #0f172a; font-size: 14px; font-weight: 600;">${escapeHtml(value)}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
      <h2 style="color: #0f172a; margin-bottom: 8px;">New Custom Trip Request</h2>
      <p style="color: #64748b; margin-top: 0;">A customer has submitted a trip request that needs your review.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">${rows}</table>
      <p style="margin: 24px 0;">
        <a href="${escapeHtml(adminUrl)}" style="display: inline-block; background: #f97316; color: #ffffff; padding: 12px 18px; border-radius: 8px; text-decoration: none; font-weight: 700;">Review Custom Trip</a>
      </p>
      <p style="font-size: 13px; color: #64748b;"><strong>Special requests:</strong><br>${escapeHtml(request.special_requests || 'None')}</p>
    </div>
  `.trim();

  try {
    const { error } = await resend.emails.send({
      from,
      to,
      subject: `New Custom Trip Request: ${request.customer_name} (${request.reference_number})`,
      html,
    });
    if (error) {
      console.warn('[resendMail] Error sending custom trip notification:', error.message);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err) {
    console.error('[resendMail] Exception sending custom trip notification:', err);
    return { ok: false, error: err.message };
  }
}
