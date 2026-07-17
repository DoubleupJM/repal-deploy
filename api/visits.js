const { getSupabase, checkAdmin } = require('./_supabase');

function toCamel(row) {
    return {
          id: row.id,
          referrer: row.referrer,
          keyword: row.keyword,
          utmSource: row.utm_source,
          utmMedium: row.utm_medium,
          utmCampaign: row.utm_campaign,
          landingUrl: row.landing_url,
          createdAt: row.created_at,
    };
}

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
          return res.status(405).json({ ok: false, error: 'method not allowed' });
    }
    if (!checkAdmin(req, res)) return;

    try {
          const supabase = getSupabase();
          const { data, error } = await supabase
            .from('visits')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(500);
          if (error) throw error;
          res.status(200).json({ ok: true, items: (data || []).map(toCamel) });
    } catch (err) {
          console.error('visits list error:', err.message);
          res.status(500).json({ ok: false, error: '서버 오류가 발생했습니다.' });
    }
};
