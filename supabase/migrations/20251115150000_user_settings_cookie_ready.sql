create extension if not exists "pgcrypto";

alter table public.user_settings
    drop constraint if exists user_settings_user_id_fkey;

alter table public.user_settings
    alter column user_id set default gen_random_uuid();
