create table if not exists public.alert_events (
    id bigint generated always as identity primary key,
    alert_id bigint not null references public.alerts(id) on delete cascade,
    channel alert_channel not null,
    delivery_status text not null,
    message text,
    payload jsonb,
    created_at timestamptz not null default now()
);

create index if not exists alert_events_alert_id_idx on public.alert_events (alert_id);

alter table public.alert_events enable row level security;

create policy "Users view own alert events"
  on public.alert_events
  for select
  using (
    exists (
      select 1 from public.alerts a
      where a.id = alert_events.alert_id
        and a.user_id = auth.uid()
    )
  );
