-- Auth owns email and password hashes. Confirmation passwords are never stored.
begin;
create table public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 100),
  surname text not null check (char_length(btrim(surname)) between 1 and 100),
  birth date not null check (birth >= date '1900-01-01' and birth <= current_date),
  created_at timestamptz not null default now()
);
alter table public.user_profiles enable row level security;
revoke all on public.user_profiles from public, anon, authenticated;
grant select on public.user_profiles to authenticated;
create policy "Read own profile" on public.user_profiles for select to authenticated
  using ((select auth.uid()) = user_id);

-- A failing profile insert rolls back account creation, avoiding partial accounts.
create function public.create_user_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.user_profiles(user_id, name, surname, birth)
  values (new.id, btrim(new.raw_user_meta_data->>'name'), btrim(new.raw_user_meta_data->>'surname'), (new.raw_user_meta_data->>'birth')::date);
  return new;
end;
$$;
revoke all on function public.create_user_profile() from public, anon, authenticated;
create trigger create_user_profile after insert on auth.users
  for each row execute procedure public.create_user_profile();
-- Existing private users remain valid; no personal data is fabricated or required retroactively.
commit;
