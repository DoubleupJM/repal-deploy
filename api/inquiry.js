const { getSupabase } = require('./_supabase');
const sendNotification = require('./send-notification');

const REQUIRED = ['brand', 'category', 'phone', 'contactName', 'contactTitle', 'email', 'productLink'];

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'method not allowed' });
  }
  try {
    const b = req.body || {};

    for (const key of REQUIRED) {
      if (!b[key] || !String(b[key]).trim()) {
        return res.status(400).json({ ok: false, error: `필수 항목이 비어 있습니다: ${key}` });
      }
    }
    if (!isValidEmail(String(b.email).trim())) {
      return res.status(400).json({ ok: false, error: '이메일 형식이 올바르지 않습니다.' });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('inquiries')
      .insert({
        brand: String(b.brand).trim().slice(0, 200),
        category: String(b.category).trim().slice(0, 100),
        phone: String(b.phone).trim().slice(0, 50),
        contact_name: String(b.contactName).trim().slice(0, 100),
        contact_title: String(b.contactTitle).trim().slice(0, 100),
        email: String(b.email).trim().slice(0, 200),
        product_link: String(b.productLink).trim().slice(0, 500),
        status: '상담전',
        referrer: (b.referrer || '').slice(0, 500) || null,
        keyword: (b.keyword || '').slice(0, 200) || null,
        utm_source: (b.utmSource || '').slice(0, 200) || null,
        utm_medium: (b.utmMedium || '').slice(0, 200) || null,
        utm_campaign: (b.utmCampaign || '').slice(0, 200) || null,
      })
      .select()
      .single();

    if (error) throw error;
    // 비동기 이메일 알림 (실패해도 응답에 영향 없음)
    sendNotification(payload).catch(()=>{});
    res.status(200).json({ ok: true, id: data.id });
  } catch (err) {
    console.error('inquiry error:', err.message);
    res.status(500).json({ ok: false, error: '서버 오류가 발생했습니다.' });
  }
};
