import './loadEnv.js';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendContactMail } from './contactMail.js';
import { adminRouter } from './adminRoutes.js';

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
