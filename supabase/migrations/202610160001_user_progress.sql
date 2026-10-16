create table public.user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  document jsonb not null check (jsonb_typeof(document) = 'object' and document->>'version' = '1'),
  revision bigint not null default 1 check (revision > 0),
  updated_at timestamptz not null default now()
);

alter table public.user_progress enable row level security;
revoke all on public.user_progress from anon, authenticated;
grant select, insert, update on public.user_progress to authenticated;
create policy "Read own progress" on public.user_progress for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Create own progress" on public.user_progress for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Update own progress" on public.user_progress for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Compare and write atomically. A stale browser must not overwrite a newer one.
create function public.save_user_progress(payload jsonb, expected_revision bigint, owner_user_id uuid)
returns bigint language plpgsql security invoker set search_path = '' as $$
declare next_revision bigint;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  if auth.uid() <> owner_user_id or owner_user_id is null then raise exception 'Account changed' using errcode = '42501'; end if;
  if octet_length(payload::text) > 5242880 then raise exception 'Progress exceeds 5 MB'; end if;
  if expected_revision = 0 then
    insert into public.user_progress(user_id, document)
    values (auth.uid(), payload)
    on conflict (user_id) do nothing returning revision into next_revision;
  else
    update public.user_progress
    set document = payload, revision = revision + 1, updated_at = now()
    where user_id = auth.uid() and revision = expected_revision
    returning revision into next_revision;
  end if;
  if next_revision is null then raise exception 'Progress changed on another device' using errcode = '40001'; end if;
  return next_revision;
end;
$$;
revoke all on function public.save_user_progress(jsonb, bigint, uuid) from public, anon;
grant execute on function public.save_user_progress(jsonb, bigint, uuid) to authenticated;
