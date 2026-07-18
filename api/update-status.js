const { getSupabase, checkAdmin } = require('./_supabase');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'method not allowed' });
  }
  if (!checkAdmin(req, res)) return;
  try {
    const { id, status } = req.body || {};
    if (!id || !status) {
      return res.status(400).json({ ok: false, error: 'id and status required' });
    }
    const supabase = getSupabase();
    const { error } = await supabase.from('inquiries').update({ status }).eq('id', id);
    if (error) throw error;
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('update-status error:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
};
