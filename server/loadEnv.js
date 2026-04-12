import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const __root = path.join(__dirname, '..');

dotenv.config({ path: path.join(__root, '.env') });
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.join(__root, '.env.local'), override: true });
  dotenv.config({ path: path.join(__root, '.env.development'), override: true });
}
