// 문의 접수 시 이메일 알림 - Resend API 사용 (무료 100건/일)
module.exports = async (inquiry) => {
  const RESEND_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_KEY) return; // 키 없으면 스킵

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_KEY}` },
      body: JSON.stringify({
        from: 'repal <onboarding@resend.dev>',
        to: ['jin@revenue-par.com'],
        subject: `[repal] 새 문의 접수: ${inquiry.brand} (${inquiry.category})`,
        html: `
          <h2>새 문의가 접수되었습니다</h2>
          <table>
            <tr><td><b>브랜드</b></td><td>${inquiry.brand}</td></tr>
            <tr><td><b>카테고리</b></td><td>${inquiry.category}</td></tr>
            <tr><td><b>담당자</b></td><td>${inquiry.contactName} (${inquiry.contactTitle})</td></tr>
            <tr><td><b>전화번호</b></td><td>${inquiry.phone}</td></tr>
            <tr><td><b>이메일</b></td><td>${inquiry.email}</td></tr>
            <tr><td><b>상품 링크</b></td><td><a href="${inquiry.productLink}">${inquiry.productLink}</a></td></tr>
            <tr><td><b>유입 경로</b></td><td>${inquiry.referrer||'-'}</td></tr>
            <tr><td><b>키워드</b></td><td>${inquiry.keyword||'-'}</td></tr>
          </table>
          <p><a href="https://revenue-par.com/admin.html">어드민에서 확인하기 →</a></p>
        `
      })
    });
  } catch (e) {
    console.warn('email notification failed:', e.message);
  }
};
