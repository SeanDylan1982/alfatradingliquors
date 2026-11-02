create table public.categories (
  id text primary key,
  name text not null,
  description text not null default ''
);

create table public.products (
  id text primary key,
  name text not null,
  brand text not null default '',
  category_id text not null references public.categories (id) on delete restrict,
  price numeric(10, 2) not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  low_stock_threshold integer not null default 0 check (low_stock_threshold >= 0),
  description text not null default '',
  details jsonb not null default '[]'::jsonb,
  images jsonb not null default '[]'::jsonb,
  featured boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create index products_category_id_idx on public.products (category_id);

create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.admins enable row level security;

create policy "Anyone can read categories"
  on public.categories for select
  using (true);

create policy "Admins manage categories"
  on public.categories for all
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Anyone can read published products"
  on public.products for select
  using (published or (select public.is_admin()));

create policy "Admins manage products"
  on public.products for all
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins can read their own admin row"
  on public.admins for select
  using (user_id = (select auth.uid()));

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  customer_name text not null default '',
  customer_phone text not null default '',
  customer_email text not null default '',
  items jsonb not null check (jsonb_typeof(items) = 'array'),
  total numeric(10, 2) not null check (total >= 0),
  status text not null default 'new' check (status in ('new', 'confirmed', 'fulfilled', 'cancelled'))
);

alter table public.orders enable row level security;

create policy "Anyone can place a new order"
  on public.orders for insert
  with check (status = 'new');

create policy "Admins read orders"
  on public.orders for select
  using ((select public.is_admin()));

create policy "Admins update orders"
  on public.orders for update
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins delete orders"
  on public.orders for delete
  using ((select public.is_admin()));
