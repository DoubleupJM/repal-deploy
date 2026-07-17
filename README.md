# repal — Vercel 무료 배포 가이드

이 폴더 그대로 배포하면 **완전히 무료**로 실제 작동하는 랜딩페이지 + 문의 접수 + 어드민 대시보드가 만들어집니다.

- 호스팅/서버리스 함수: **Vercel** (무료 Hobby 플랜)
- 데이터베이스: **Supabase** (무료 플랜, 500MB DB + 무제한에 가까운 API 요청)

둘 다 신용카드 없이 가입 가능하고, 이 프로젝트 규모(문의 몇백~몇천 건)에서는 평생 무료 티어 안에서 충분히 운영됩니다.

---

## 1. Supabase 프로젝트 만들기 (5분)

1. https://supabase.com → 회원가입 → **New Project** 생성 (리전은 `Northeast Asia (Seoul)` 선택)
2. 프로젝트가 만들어지면 왼쪽 메뉴 **SQL Editor** 클릭
3. 이 폴더의 `supabase-schema.sql` 파일 내용을 전체 복사해서 붙여넣고 **Run** 실행
   → `inquiries`, `visits` 테이블이 생성됩니다.
4. 왼쪽 메뉴 **Project Settings → API** 로 이동해서 아래 2개 값을 복사해두세요.
   - `Project URL` → 이게 `SUPABASE_URL`
   - `service_role` 키 (⚠️ `anon` 키 아님, `service_role` 키) → 이게 `SUPABASE_SERVICE_ROLE_KEY`

> `service_role` 키는 DB 전체 권한을 가진 매우 민감한 키입니다. 절대 프론트엔드 코드나 GitHub에 그대로 올리지 말고, 반드시 Vercel의 **환경변수**로만 등록하세요. (이 프로젝트 구조는 이미 그렇게 되어 있습니다 — API 폴더의 서버 코드에서만 사용됩니다.)

---

## 2. GitHub에 올리기

```bash
cd repal-deploy
git init
git add .
git commit -m "repal site"
git branch -M main
git remote add origin <내 GitHub 저장소 주소>
git push -u origin main
```

(GitHub 없이 바로 배포하고 싶다면 `npx vercel` 로 CLI 배포도 가능합니다 — 3번 항목 참고)

---

## 3. Vercel 배포

### 방법 A — 웹 대시보드 (추천)
1. https://vercel.com → 로그인 → **Add New → Project**
2. 방금 올린 GitHub 저장소 선택 → Import
3. **Environment Variables**에 아래 3개 추가:

   | Key | Value |
   |---|---|
   | `SUPABASE_URL` | 1번에서 복사한 Project URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | 1번에서 복사한 service_role 키 |
   | `ADMIN_TOKEN` | 직접 정하는 임의의 비밀번호 (예: `repal-2026-xy9k`) |

4. **Deploy** 클릭 → 몇십 초 후 `https://내프로젝트.vercel.app` 주소로 배포 완료

### 방법 B — CLI
```bash
npm i -g vercel
cd repal-deploy
vercel
# 프롬프트대로 진행 후:
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add ADMIN_TOKEN
vercel --prod
```

---

## 4. 확인하기

- 랜딩페이지: `https://내프로젝트.vercel.app/`
  → 문의하기 폼 작성 후 제출하면 Supabase `inquiries` 테이블에 저장됩니다.
- 어드민: `https://내프로젝트.vercel.app/admin.html`
  → 3번에서 설정한 `ADMIN_TOKEN` 값을 입력하면 접속됩니다.
  → **문의 접수함** 탭에서 상담 전/중/후 필터링 및 상태 변경
  → **방문 트래킹** 탭에서 유입 경로(리퍼러)·키워드·UTM 값 확인

---

## 폴더 구조

```
repal-deploy/
├─ index.html            # 랜딩페이지
├─ admin.html             # 어드민 대시보드
├─ api/
│  ├─ _supabase.js        # Supabase 클라이언트 + 관리자 인증 헬퍼
│  ├─ track.js            # POST  방문 로그 기록 (공개)
│  ├─ inquiry.js          # POST  문의 접수 (공개)
│  ├─ inquiries.js        # GET   문의 목록 (관리자 전용)
│  ├─ visits.js           # GET   방문 목록 (관리자 전용)
│  └─ update-status.js    # POST  문의 상태 변경 (관리자 전용)
├─ supabase-schema.sql     # Supabase에 실행할 테이블 생성 SQL
├─ package.json
└─ .env.example
```

## 참고사항

- 어드민 인증은 간단한 "공유 토큰" 방식입니다. 팀 내부용으로는 충분하지만, 팀원이 늘어나면 Supabase Auth 같은 정식 로그인으로 업그레이드하는 걸 권장드립니다.
- 무료 티어 한도(Supabase 500MB, Vercel 함수 실행량)를 넘어서는 규모로 커지면 유료 플랜 전환이 필요할 수 있습니다. 지금 규모(랜딩페이지 문의 접수)에서는 사실상 넘길 일이 없습니다.
- 도메인을 연결하고 싶다면 Vercel 프로젝트 설정의 **Domains** 메뉴에서 보유 중인 도메인을 추가하면 됩니다 (도메인 자체 구매 비용은 별도).

