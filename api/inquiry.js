const { getSupabase } = require('./_supabase');

const REQUIRED = ['brand', 'category', 'phone', 'contactName', 'contactTitle', 'email', 'productLink'];

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

async function sendEmail(inquiry) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        from: 'repal <noreply@revenue-par.com>',
        to: ['jin@revenue-par.com'],
        subject: `[repal] 새 문의: ${inquiry.brand} (${inquiry.category})`,
        html: `<h2>새 문의가 접수되었습니다</h2>
<p><b>브랜드:</b> ${inquiry.brand}</p>
<p><b>카테고리:</b> ${inquiry.category}</p>
<p><b>담당자:</b> ${inquiry.contactName} (${inquiry.contactTitle})</p>
<p><b>전화:</b> ${inquiry.phone}</p>
<p><b>이메일:</b> ${inquiry.email}</p>
<p><b>상품링크:</b> <a href="${inquiry.productLink}">${inquiry.productLink}</a></p>
<p><b>유입경로:</b> ${inquiry.referrer||'-'}</p>
<p><a href="https://revenue-par.com/admin.html">어드민 확인하기</a></p>`
      })
    });
    console.log('email sent:', r.status);
  } catch(e) {
    console.warn('email failed:', e.message);
  }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'method not allowed' });
  }
  try {
    const b = req.body || {};
    for (const key of REQUIRED) {
      if (!b[key] || !String(b[key]).trim()) {
        return res.status(400).json({ ok: false, error: `필수 항목 누락: ${key}` });
      }
    }
    if (!isValidEmail(String(b.email).trim())) {
      return res.status(400).json({ ok: false, error: '이메일 형식 오류' });
    }

    const supabase = getSupabase();
    const row = {
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
    };

    const { data, error } = await supabase.from('inquiries').insert(row).select().single();
    if (error) throw error;

    // 비동기 이메일 (실패해도 응답 영향 없음)
    sendEmail(row).catch(() => {});

    res.status(200).json({ ok: true, id: data.id });
  } catch (err) {
    console.error('inquiry error:', err.message);
    res.status(500).json({ ok: false, error: '서버 오류' });
  }
};
