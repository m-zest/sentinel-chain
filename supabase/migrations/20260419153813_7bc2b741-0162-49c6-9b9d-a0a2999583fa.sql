create extension if not exists "pgcrypto";

do $$ begin create type public.app_role as enum ('viewer', 'analyst', 'admin'); exception when duplicate_object then null; end $$;
do $$ begin create type public.severity_level as enum ('low','watch','elevated','critical'); exception when duplicate_object then null; end $$;
do $$ begin create type public.event_type as enum ('conflict','sanction','disaster','strike','accident','policy'); exception when duplicate_object then null; end $$;
do $$ begin create type public.supplier_type as enum ('refinery','port','pipeline','storage','chokepoint'); exception when duplicate_object then null; end $$;
do $$ begin create type public.transport_mode as enum ('sea','air','rail','pipeline'); exception when duplicate_object then null; end $$;
do $$ begin create type public.commodity_type as enum ('jet_fuel','crude_brent','crude_wti','diesel'); exception when duplicate_object then null; end $$;

create table public.regions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country_code text not null,
  latitude numeric not null,
  longitude numeric not null,
  risk_level public.severity_level not null default 'low',
  summary text,
  created_at timestamptz not null default now()
);

create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type public.supplier_type not null,
  region_id uuid references public.regions(id) on delete set null,
  capacity_bpd integer,
  criticality_score integer default 50,
  latitude numeric,
  longitude numeric,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.routes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  origin_region_id uuid references public.regions(id) on delete set null,
  destination_region_id uuid references public.regions(id) on delete set null,
  mode public.transport_mode not null,
  annual_volume_bbl bigint,
  risk_score integer default 0,
  waypoints jsonb default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table public.airports (
  id uuid primary key default gen_random_uuid(),
  iata_code text unique not null,
  name text not null,
  region_id uuid references public.regions(id) on delete set null,
  latitude numeric,
  longitude numeric,
  annual_fuel_demand_bbl bigint,
  fuel_source_ids jsonb default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table public.risk_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_type public.event_type not null,
  severity public.severity_level not null,
  affected_region_ids jsonb default '[]'::jsonb,
  affected_route_ids jsonb default '[]'::jsonb,
  source_url text,
  detected_at timestamptz not null default now(),
  resolved_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index on public.risk_events (detected_at desc);
create index on public.risk_events (severity);

create table public.price_snapshots (
  id uuid primary key default gen_random_uuid(),
  commodity public.commodity_type not null,
  region_id uuid references public.regions(id) on delete set null,
  price_usd numeric not null,
  unit text not null default 'USD/gallon',
  snapshot_at timestamptz not null default now()
);
create index on public.price_snapshots (commodity, snapshot_at desc);

create table public.news_articles (
  id uuid primary key default gen_random_uuid(),
  headline text not null,
  summary text,
  source text,
  source_url text,
  published_at timestamptz not null default now(),
  risk_score integer default 0,
  tags jsonb default '[]'::jsonb,
  linked_event_id uuid references public.risk_events(id) on delete set null,
  created_at timestamptz not null default now()
);
create index on public.news_articles (published_at desc);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan text not null default 'trial',
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  org_id uuid references public.organizations(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create table public.watchlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null check (entity_type in ('airport','route','supplier','region')),
  entity_id uuid not null,
  created_at timestamptz not null default now(),
  unique(user_id, entity_type, entity_id)
);

create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  trigger_config jsonb not null default '{}'::jsonb,
  channel text not null default 'in_app' check (channel in ('email','in_app','both')),
  last_fired_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.scenarios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  trigger_config jsonb not null default '{}'::jsonb,
  result_summary text,
  result_details jsonb,
  generated_at timestamptz,
  is_saved boolean not null default false,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  insert into public.user_roles (user_id, role) values (new.id, 'analyst');
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

alter table public.regions enable row level security;
alter table public.suppliers enable row level security;
alter table public.routes enable row level security;
alter table public.airports enable row level security;
alter table public.risk_events enable row level security;
alter table public.price_snapshots enable row level security;
alter table public.news_articles enable row level security;
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.watchlist_items enable row level security;
alter table public.alerts enable row level security;
alter table public.scenarios enable row level security;

create policy "ref_regions_read" on public.regions for select to authenticated using (true);
create policy "ref_suppliers_read" on public.suppliers for select to authenticated using (true);
create policy "ref_routes_read" on public.routes for select to authenticated using (true);
create policy "ref_airports_read" on public.airports for select to authenticated using (true);
create policy "ref_events_read" on public.risk_events for select to authenticated using (true);
create policy "ref_prices_read" on public.price_snapshots for select to authenticated using (true);
create policy "ref_news_read" on public.news_articles for select to authenticated using (true);

create policy "admin_events_write" on public.risk_events for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admin_news_write" on public.news_articles for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admin_regions_write" on public.regions for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create policy "profiles_self_read" on public.profiles for select to authenticated using (id = auth.uid());
create policy "profiles_self_update" on public.profiles for update to authenticated using (id = auth.uid());
create policy "roles_self_read" on public.user_roles for select to authenticated using (user_id = auth.uid());
create policy "orgs_member_read" on public.organizations for select to authenticated using (true);
create policy "watch_self_all" on public.watchlist_items for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "alerts_self_all" on public.alerts for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "scenarios_self_all" on public.scenarios for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "scenarios_public_read" on public.scenarios for select to anon, authenticated using (is_public = true);