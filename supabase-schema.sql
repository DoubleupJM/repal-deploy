-- repal: Supabase 스키마
-- Supabase 대시보드 > SQL Editor 에서 그대로 실행하세요.

create extension if not exists "pgcrypto";

create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  category text not null,
  phone text not null,
  contact_name text not null,
  contact_title text not null,
  email text not null,
  product_link text not null,
  status text not null default '상담전' check (status in ('상담전', '상담중', '상담후')),
  referrer text,
  keyword text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz not null default now()
);

create table if not exists visits (
  id uuid primary key default gen_random_uuid(),
  referrer text,
  keyword text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  landing_url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_inquiries_created_at on inquiries (created_at desc);
create index if not exists idx_inquiries_status on inquiries (status);
create index if not exists idx_visits_created_at on visits (created_at desc);

-- RLS(행 수준 보안)를 켜 두되, 별도의 public 정책은 만들지 않습니다.
-- 모든 접근은 서버(Vercel Functions)에서 service_role 키로만 이루어지므로
-- 브라우저에서 테이블에 직접 접근하는 경로는 막혀 있습니다.
alter table inquiries enable row level security;
alter table visits enable row level security;
