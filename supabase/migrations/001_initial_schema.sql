-- ============================================
-- CARTA DIGITAL INTERACTIVA
-- Migration 001
-- Initial products schema
-- ============================================

create table if not exists public.products (
    id uuid primary key default gen_random_uuid(),

    name text not null,

    category text not null,

    price numeric(12,2) not null default 0,

    description text,

    is_available boolean not null default true,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);


-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.products enable row level security;


-- ============================================
-- PUBLIC READ
-- ============================================

drop policy if exists "Public can read products"
on public.products;

create policy "Public can read products"
on public.products

for select

to anon

using (true);


-- ============================================
-- MVP UPDATE
-- ============================================

drop policy if exists "Anon can update product availability"
on public.products;

create policy "Anon can update product availability"
on public.products

for update

to anon

using (true)

with check (true);


-- ============================================
-- PERMISSIONS
-- ============================================

grant select
on public.products
to anon;

grant update
on public.products
to anon;


-- ============================================
-- REALTIME
-- ============================================

alter publication supabase_realtime
add table public.products;