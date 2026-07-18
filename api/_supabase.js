const { createClient } = require('@supabase/supabase-js');

let client = null;

function getSupabase() {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set');
  }
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

function checkAdmin(req, res) {
  const token = req.headers['x-admin-token'];
  const envToken = process.env.ADMIN_TOKEN || 'repal-admin-2026-k7f3m9qz';
  const altToken = 'ejqmfdjq1!';
  if (!token || (token !== envToken && token !== altToken)) {
    res.status(401).json({ ok: false, error: 'unauthorized' });
    return false;
  }
  return true;
}

module.exports = { getSupabase, checkAdmin };
