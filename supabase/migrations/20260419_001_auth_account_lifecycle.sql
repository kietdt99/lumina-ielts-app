alter table public.profiles
add column if not exists role text not null default 'learner'
check (role in ('admin', 'learner'));

create table if not exists public.user_security_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  must_change_password boolean not null default false,
  password_changed_at timestamptz,
  created_by_admin_id uuid references public.profiles(id) on delete set null,
  temporary_password_issued_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.user_goals
add column if not exists exam_date date,
add column if not exists completed_onboarding boolean not null default false;

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_user_security_settings_created_by_admin_id
on public.user_security_settings(created_by_admin_id);

drop trigger if exists user_security_settings_set_updated_at on public.user_security_settings;
create trigger user_security_settings_set_updated_at
before update on public.user_security_settings
for each row
execute function public.handle_updated_at();

alter table public.user_security_settings enable row level security;

create policy if not exists "user_security_settings_select_own"
on public.user_security_settings
for select
using (auth.uid() = user_id);

create policy if not exists "user_security_settings_insert_own"
on public.user_security_settings
for insert
with check (auth.uid() = user_id);

create policy if not exists "user_security_settings_update_own"
on public.user_security_settings
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
