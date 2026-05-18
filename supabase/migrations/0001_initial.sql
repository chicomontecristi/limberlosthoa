-- Limberlost HOA Portal — initial schema
-- Run this once in the Supabase SQL Editor on a fresh project.

-- =========================================================
-- Tables
-- =========================================================

create table if not exists owners (
  id           uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete cascade unique,
  property_id  text not null unique,
  full_name    text not null,
  email        text not null unique,
  phone        text,
  address      text,
  is_admin     boolean default false,
  created_at   timestamptz default now()
);

create index if not exists owners_property_id_idx on owners(property_id);
create index if not exists owners_email_idx on owners(email);

do $$ begin
  create type dues_status as enum ('paid', 'due', 'pending', 'waived');
exception when duplicate_object then null;
end $$;

create table if not exists dues (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid references owners(id) on delete cascade not null,
  period       text not null,
  amount_cents integer not null,
  status       dues_status not null default 'due',
  due_date     date not null,
  paid_date    date,
  note         text,
  updated_at   timestamptz default now(),
  updated_by   uuid references owners(id)
);

create unique index if not exists dues_owner_period_idx on dues(owner_id, period);
create index if not exists dues_status_idx on dues(status);

create table if not exists announcements (
  id          uuid primary key default gen_random_uuid(),
  sent_by     uuid references owners(id) not null,
  subject     text not null,
  body_md     text not null,
  recipients  integer not null,
  resend_id   text,
  sent_at     timestamptz default now()
);

create index if not exists announcements_sent_at_idx on announcements(sent_at desc);

-- =========================================================
-- Row Level Security
-- =========================================================

alter table owners       enable row level security;
alter table dues         enable row level security;
alter table announcements enable row level security;

drop policy if exists owners_self_read on owners;
create policy owners_self_read on owners
  for select using (auth_user_id = auth.uid());

drop policy if exists owners_admin_read on owners;
create policy owners_admin_read on owners
  for select using (
    exists (select 1 from owners o where o.auth_user_id = auth.uid() and o.is_admin)
  );

drop policy if exists dues_self_read on dues;
create policy dues_self_read on dues
  for select using (
    owner_id = (select id from owners where auth_user_id = auth.uid())
  );

drop policy if exists dues_admin_all on dues;
create policy dues_admin_all on dues
  for all using (
    exists (select 1 from owners o where o.auth_user_id = auth.uid() and o.is_admin)
  );

drop policy if exists announcements_admin_all on announcements;
create policy announcements_admin_all on announcements
  for all using (
    exists (select 1 from owners o where o.auth_user_id = auth.uid() and o.is_admin)
  );

-- =========================================================
-- Storage buckets (run via Supabase Dashboard if SQL fails)
-- =========================================================
-- insert into storage.buckets (id, name, public) values ('hoa-pdfs', 'hoa-pdfs', false)
--   on conflict (id) do nothing;
-- insert into storage.buckets (id, name, public) values ('member-photos', 'member-photos', true)
--   on conflict (id) do nothing;
-- insert into storage.buckets (id, name, public) values ('event-photos', 'event-photos', true)
--   on conflict (id) do nothing;

-- =========================================================
-- Seed example (delete before production)
-- =========================================================
-- insert into owners (property_id, full_name, email) values
--   ('LH-001', 'Test Owner', 'test@example.com')
--   on conflict do nothing;
