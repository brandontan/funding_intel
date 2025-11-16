alter table public.user_settings
  add column if not exists email_address text;

alter table public.user_settings
  add column if not exists telegram_handle text;

create index if not exists user_settings_email_idx on public.user_settings ((lower(email_address))) where email_address is not null;
create index if not exists user_settings_telegram_idx on public.user_settings ((lower(telegram_handle))) where telegram_handle is not null;
