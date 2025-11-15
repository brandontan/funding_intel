-- Funding Intelligence schema

create type public.exchange_name as enum ('binance','bybit','okx');
create type public.alert_channel as enum ('email','telegram');
create type public.alert_status as enum ('active','paused');
create type public.risk_grade as enum ('A','B','C');

create table if not exists public.user_settings (
    user_id uuid primary key references auth.users(id) on delete cascade,
    capital_default numeric(18,2) not null default 10000,
    leverage numeric(6,2) not null default 1,
    preferred_exchanges exchange_name[] not null default ARRAY['binance']::exchange_name[],
    alert_channels alert_channel[] not null default ARRAY['email']::alert_channel[],
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint chk_capital_positive check (capital_default >= 0),
    constraint chk_leverage_min check (leverage >= 1)
);

create table if not exists public.funding_rates (
    id bigint generated always as identity primary key,
    exchange exchange_name not null,
    pair text not null,
    funding_rate numeric(9,6) not null,
    mark_price numeric(18,8) not null,
    next_funding_time timestamptz,
    fetched_at timestamptz not null default now()
);

create unique index if not exists funding_rates_exchange_pair_time_idx
    on public.funding_rates (exchange, pair, fetched_at);

create table if not exists public.opportunities (
    id bigint generated always as identity primary key,
    exchange exchange_name not null,
    pair text not null,
    current_funding_rate numeric(9,6) not null,
    net_rate_after_fees numeric(9,6) not null,
    persistence_score numeric(5,4) not null,
    volatility_score numeric(5,4) not null,
    exchange_trust numeric(5,4) not null,
    risk risk_grade not null,
    spread_vs_spot numeric(9,6),
    capital_required numeric(18,2),
    updated_at timestamptz not null default now()
);

create unique index if not exists opportunities_exchange_pair_idx
    on public.opportunities (exchange, pair);

create table if not exists public.alerts (
    id bigint generated always as identity primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    exchange exchange_name,
    pair text,
    threshold_rate numeric(9,6) not null,
    channel alert_channel not null,
    status alert_status not null default 'active',
    last_triggered_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.ingestion_metrics (
    id bigint generated always as identity primary key,
    exchange exchange_name not null,
    latency_ms integer not null,
    status text not null,
    metadata jsonb,
    recorded_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_user_settings_updated
before update on public.user_settings
for each row execute procedure public.touch_updated_at();

create trigger trg_alerts_updated
before update on public.alerts
for each row execute procedure public.touch_updated_at();

create trigger trg_opportunities_updated
before update on public.opportunities
for each row execute procedure public.touch_updated_at();

alter table public.user_settings enable row level security;
alter table public.alerts enable row level security;

create policy "User can view own settings"
    on public.user_settings
    for select using (auth.uid() = user_id);

create policy "User can upsert own settings"
    on public.user_settings
    for all using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "User can view own alerts"
    on public.alerts
    for select using (auth.uid() = user_id);

create policy "User can manage own alerts"
    on public.alerts
    for all using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
