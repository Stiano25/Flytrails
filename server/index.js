import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', name: 'Flytrails API' });
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
