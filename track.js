const { getSupabase } = require('./_supabase');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'method not allowed' });
  }
  try {
    const b = req.body || {};
    const supabase = getSupabase();
    const { error } = await supabase.from('visits').insert({
      referrer: (b.referrer || '').slice(0, 500) || null,
      keyword: (b.keyword || '').slice(0, 200) || null,
      utm_source: (b.utmSource || '').slice(0, 200) || null,
      utm_medium: (b.utmMedium || '').slice(0, 200) || null,
      utm_campaign: (b.utmCampaign || '').slice(0, 200) || null,
      landing_url: (b.landingUrl || '').slice(0, 500) || null,
    });
    if (error) throw error;
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('track error:', err.message);
    // Visit tracking failures should never break the page — respond 200 either way.
    res.status(200).json({ ok: false });
  }
};
