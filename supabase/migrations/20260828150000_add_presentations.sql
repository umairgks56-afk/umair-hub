create table if not exists public.presentations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  material_id uuid references public.materials(id) on delete set null,
  title text not null,
  slides jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists presentations_user_id_idx on public.presentations(user_id);
create index if not exists presentations_course_id_idx on public.presentations(course_id);
alter table public.presentations enable row level security;
create policy presentations_select_own on public.presentations for select using (auth.uid() = user_id);
create policy presentations_insert_own on public.presentations for insert with check (auth.uid() = user_id);
create policy presentations_update_own on public.presentations for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy presentations_delete_own on public.presentations for delete using (auth.uid() = user_id);
