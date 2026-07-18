const { getSupabase, checkAdmin } = require('./_supabase');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'method not allowed' });
  }
  if (!checkAdmin(req, res)) return;
  try {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ ok: false, error: 'id required' });
    const supabase = getSupabase();
    const { error } = await supabase.from('inquiries').delete().eq('id', id);
    if (error) throw error;
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('delete-inquiry error:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
};
