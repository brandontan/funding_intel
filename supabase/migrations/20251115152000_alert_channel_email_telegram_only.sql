-- Ensure existing whatsapp preferences fallback to email before shrinking enum
update public.user_settings
set alert_channels = array_replace(alert_channels, 'whatsapp', 'email')
where array_position(alert_channels, 'whatsapp') is not null;

update public.alerts
set channel = 'email'
where channel = 'whatsapp';

alter table public.user_settings
  alter column alert_channels drop default;

alter type public.alert_channel rename to alert_channel_old;

create type public.alert_channel as enum ('email','telegram');

alter table public.user_settings
  alter column alert_channels type alert_channel[]
  using coalesce(
    array(
      select (unnest(alert_channels))::text::alert_channel
    ),
    array[]::alert_channel[]
  );

alter table public.user_settings
  alter column alert_channels set default array['email']::alert_channel[];

alter table public.alerts
  alter column channel type alert_channel
  using channel::text::alert_channel;

drop type public.alert_channel_old;
