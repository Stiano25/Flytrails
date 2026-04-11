import { supabase } from './supabase.js';

/**
 * Calls the Express /api/admin API with the current Supabase session.
 * @param {string} path - e.g. '/users' (leading slash optional)
 * @param {RequestInit} [options]
 */
export async function adminFetch(path, options = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Not signed in.');
  }
  const p = path.startsWith('/') ? path : `/${path}`;
  let body = options.body;
  const headers = {
    Authorization: `Bearer ${session.access_token}`,
    ...options.headers,
  };
  if (body != null && typeof body === 'object' && !(body instanceof FormData)) {
    body = JSON.stringify(body);
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`/api/admin${p}`, { ...options, body, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || res.statusText || 'Request failed');
  }
  return data;
}
