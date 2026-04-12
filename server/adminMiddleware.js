import { getSupabaseAdmin } from './supabaseAdmin.js';

function parseBearer(req) {
  const h = req.headers.authorization;
  if (!h || typeof h !== 'string') return null;
  const m = /^Bearer\s+(.+)$/i.exec(h.trim());
  return m ? m[1] : null;
}

/** Loads authenticated user + admin_staff row. Sets req.authUser, req.staff. */
export async function requireStaff(req, res, next) {
  const token = parseBearer(req);
  if (!token) {
    res.status(401).json({ error: 'Missing or invalid Authorization header.' });
    return;
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    res.status(503).json({ error: 'Server is not configured for admin (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).' });
    return;
  }

  const { data: userData, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !userData?.user) {
    res.status(401).json({ error: 'Invalid or expired session.' });
    return;
  }

  const userId = userData.user.id;
  const { data: staffRow, error: staffErr } = await supabase
    .from('admin_staff')
    .select('user_id, role, is_active')
    .eq('user_id', userId)
    .maybeSingle();

  if (staffErr) {
    console.error(staffErr);
    res.status(500).json({ error: 'Could not load staff profile.' });
    return;
  }

  if (!staffRow || !staffRow.is_active) {
    res.status(403).json({ error: 'Not an active staff account.' });
    return;
  }

  req.authUser = userData.user;
  req.staff = staffRow;
  req.accessToken = token;
  req.supabaseAdmin = supabase;
  next();
}

export function requireSuperadmin(req, res, next) {
  if (req.staff?.role !== 'superadmin') {
    res.status(403).json({ error: 'Superadmin only.' });
    return;
  }
  next();
}
