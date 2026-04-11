import { Router } from 'express';
import { requireStaff, requireSuperadmin } from './adminMiddleware.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(s) {
  return typeof s === 'string' && UUID_RE.test(s);
}

export const adminRouter = Router();

adminRouter.get('/me', requireStaff, (req, res) => {
  res.json({
    role: req.staff.role,
    isActive: req.staff.is_active,
    email: req.authUser.email ?? null,
    userId: req.staff.user_id,
  });
});

adminRouter.get('/users', requireStaff, requireSuperadmin, async (req, res) => {
  const supabase = req.supabaseAdmin;

  const { data: staffRows, error: staffErr } = await supabase.from('admin_staff').select('*').order('created_at');
  if (staffErr) {
    console.error(staffErr);
    res.status(500).json({ error: 'Could not list staff.' });
    return;
  }

  const users = await Promise.all(
    (staffRows || []).map(async (row) => {
      const { data: uData } = await supabase.auth.admin.getUserById(row.user_id);
      return {
        id: row.user_id,
        email: uData?.user?.email ?? null,
        role: row.role,
        isActive: row.is_active,
        createdAt: row.created_at,
      };
    }),
  );

  res.json({ users, total: users.length });
});

adminRouter.post('/users', requireStaff, requireSuperadmin, async (req, res) => {
  const supabase = req.supabaseAdmin;
  const { email, password, role } = req.body || {};

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }
  if (role && role !== 'co_admin') {
    res.status(400).json({ error: 'Only co_admin can be created via this API.' });
    return;
  }

  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email: String(email).trim(),
    password: String(password),
    email_confirm: true,
  });

  if (createErr || !created?.user) {
    res.status(400).json({ error: createErr?.message || 'Could not create user.' });
    return;
  }

  const userId = created.user.id;
  const { error: insErr } = await supabase.from('admin_staff').insert({
    user_id: userId,
    role: 'co_admin',
    is_active: true,
  });

  if (insErr) {
    await supabase.auth.admin.deleteUser(userId);
    console.error(insErr);
    res.status(500).json({ error: 'User was created but staff profile failed; rolled back.' });
    return;
  }

  res.status(201).json({
    id: userId,
    email: created.user.email,
    role: 'co_admin',
    isActive: true,
  });
});

adminRouter.patch('/users/:id/password', requireStaff, requireSuperadmin, async (req, res) => {
  const supabase = req.supabaseAdmin;
  const { id } = req.params;
  const { password } = req.body || {};

  if (!isUuid(id)) {
    res.status(400).json({ error: 'Invalid user id.' });
    return;
  }
  if (!password || String(password).length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters.' });
    return;
  }

  const { data: target, error: tErr } = await supabase
    .from('admin_staff')
    .select('user_id, role')
    .eq('user_id', id)
    .maybeSingle();

  if (tErr || !target) {
    res.status(404).json({ error: 'Staff user not found.' });
    return;
  }

  const { error: updErr } = await supabase.auth.admin.updateUserById(id, {
    password: String(password),
  });

  if (updErr) {
    res.status(400).json({ error: updErr.message || 'Could not update password.' });
    return;
  }

  res.json({ success: true });
});

adminRouter.patch('/users/:id', requireStaff, requireSuperadmin, async (req, res) => {
  const supabase = req.supabaseAdmin;
  const { id } = req.params;
  const { is_active: isActive } = req.body || {};

  if (!isUuid(id)) {
    res.status(400).json({ error: 'Invalid user id.' });
    return;
  }
  if (typeof isActive !== 'boolean') {
    res.status(400).json({ error: 'is_active (boolean) is required.' });
    return;
  }

  if (id === req.staff.user_id) {
    res.status(400).json({ error: 'You cannot change your own active status.' });
    return;
  }

  const { data: target, error: tErr } = await supabase
    .from('admin_staff')
    .select('user_id, role')
    .eq('user_id', id)
    .maybeSingle();

  if (tErr || !target) {
    res.status(404).json({ error: 'Staff user not found.' });
    return;
  }

  if (target.role === 'superadmin') {
    res.status(400).json({ error: 'Cannot deactivate the superadmin account.' });
    return;
  }

  const { error: updErr } = await supabase
    .from('admin_staff')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('user_id', id);

  if (updErr) {
    console.error(updErr);
    res.status(500).json({ error: 'Could not update staff status.' });
    return;
  }

  res.json({ success: true, isActive });
});

adminRouter.delete('/users/:id', requireStaff, requireSuperadmin, async (req, res) => {
  const supabase = req.supabaseAdmin;
  const { id } = req.params;

  if (!isUuid(id)) {
    res.status(400).json({ error: 'Invalid user id.' });
    return;
  }

  if (id === req.staff.user_id) {
    res.status(400).json({ error: 'You cannot delete your own account.' });
    return;
  }

  const { data: target, error: tErr } = await supabase
    .from('admin_staff')
    .select('user_id, role')
    .eq('user_id', id)
    .maybeSingle();

  if (tErr || !target) {
    res.status(404).json({ error: 'Staff user not found.' });
    return;
  }

  if (target.role === 'superadmin') {
    res.status(400).json({ error: 'Cannot delete the superadmin account.' });
    return;
  }

  const { error: delErr } = await supabase.auth.admin.deleteUser(id);
  if (delErr) {
    res.status(400).json({ error: delErr.message || 'Could not delete user.' });
    return;
  }

  res.json({ success: true });
});
