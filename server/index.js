import './loadEnv.js';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendContactMail } from './contactMail.js';
import { adminRouter } from './adminRoutes.js';
import { mpesaRouter } from './mpesaRoutes.js';
import { getSupabaseAdmin } from './supabaseAdmin.js';
import { sendAdminCustomTripAlert } from './resendMail.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const __root = path.join(__dirname, '..');
const app = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '32kb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', name: 'Flytrails API' });
});

app.use('/api/admin', adminRouter);
app.use('/api/mpesa', mpesaRouter);

app.post('/api/custom-trips', async (req, res) => {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    res.status(503).json({ error: 'Database service is temporarily unavailable.' });
    return;
  }

  const body = req.body || {};
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const phone = String(body.phone || '').trim();
  const tripType = String(body.tripType || '').trim();
  const destination = String(body.destination || '').trim();
  const travelDates = String(body.travelDates || '').trim();
  const adults = Number(body.adults);
  const children = Number(body.children || 0);

  if (name.length < 2 || name.length > 120) {
    res.status(400).json({ error: 'Please enter a valid full name.' });
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'Please enter a valid email address.' });
    return;
  }
  if (phone.length < 7 || phone.length > 30) {
    res.status(400).json({ error: 'Please enter a valid WhatsApp number.' });
    return;
  }
  if (!destination || !travelDates || !Number.isInteger(adults) || adults < 1 || !Number.isInteger(children) || children < 0) {
    res.status(400).json({ error: 'Please complete the destination, dates, and traveler details.' });
    return;
  }

  const request = {
    customer_name: name,
    customer_email: email,
    customer_phone: phone,
    trip_type: tripType || null,
    destination,
    travel_dates: travelDates,
    adults,
    children,
    budget: String(body.budget || '').trim() || null,
    special_requests: String(body.specialRequests || '').trim() || null,
  };
  const { data, error } = await supabase.from('custom_trip_requests').insert(request).select().single();
  if (error) {
    console.error('[customTrips] Could not save request:', error);
    res.status(500).json({ error: 'Could not save your request. Please try again.' });
    return;
  }

  const notification = await sendAdminCustomTripAlert(data);
  if (!notification.ok) {
    console.warn('[customTrips] Request saved but admin notification failed:', notification.error);
  }
  res.status(201).json({ success: true, referenceNumber: data.reference_number });
});

app.post('/api/contact', async (req, res) => {
  const { name, email, phone, subject, message } = req.body || {};

  if (!name || !email || !subject || !message) {
    res.status(400).json({ error: 'Name, email, subject, and message are required.' });
    return;
  }

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
  if (!emailOk) {
    res.status(400).json({ error: 'Please enter a valid email address.' });
    return;
  }

  const result = await sendContactMail({
    name,
    email,
    phone: phone || '',
    subject,
    message,
  });

  if (!result.ok) {
    res.status(result.status).json({ error: result.error });
    return;
  }

  res.json({ success: true, message: 'Message sent successfully' });
});

app.post('/api/newsletter', async (req, res) => {
  const { email } = req.body || {};

  if (!email) {
    res.status(400).json({ error: 'Email is required.' });
    return;
  }

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
  if (!emailOk) {
    res.status(400).json({ error: 'Please enter a valid email address.' });
    return;
  }

  const result = await sendContactMail({
    name: 'Newsletter Subscriber',
    email,
    subject: 'New Newsletter Subscription',
    message: `${email} has subscribed to receive future updates.`,
  });

  if (!result.ok) {
    res.status(result.status).json({ error: result.error });
    return;
  }

  res.json({ success: true, message: 'Subscribed successfully' });
});

if (isProd) {
  const dist = path.join(__dirname, '../client/dist');
  app.use(express.static(dist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      next();
      return;
    }
    res.sendFile(path.join(dist, 'index.html'), (err) => {
      if (err) next(err);
    });
  });
}

app.listen(PORT, () => {
  if (isProd) {
    console.log(`Flytrails production server: http://localhost:${PORT}`);
  } else {
    console.log(`Flytrails API (dev): http://localhost:${PORT}/api/health — Vite: http://localhost:5173`);
  }
});
