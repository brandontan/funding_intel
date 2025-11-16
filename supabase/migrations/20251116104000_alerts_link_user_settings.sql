alter table public.alerts
  drop constraint if exists alerts_user_id_fkey;

alter table public.alerts
  add constraint alerts_user_id_fkey
  foreign key (user_id) references public.user_settings(user_id) on delete cascade;
