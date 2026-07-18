module.exports = async (req, res) => {
  const key = process.env.RESEND_API_KEY;
  if (!key) return res.status(500).json({ ok: false, error: 'RESEND_API_KEY not set' });
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        from: 'repal <noreply@revenue-par.com>',
        to: ['jin@revenue-par.com'],
        subject: '[repal] 이메일 연동 최종 테스트',
        html: '<h2>✅ 이메일 연동 성공!</h2><p>문의가 접수되면 이 형식으로 알림 메일이 발송됩니다.</p>'
      })
    });
    const d = await r.json();
    res.status(r.ok ? 200 : 400).json({ ok: r.ok, status: r.status, data: d });
  } catch(err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};
