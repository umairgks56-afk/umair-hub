create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key,
  name text,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  code text,
  created_at timestamptz not null default now()
);

create table if not exists materials (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  name text not null,
  mime_type text not null,
  size_bytes bigint not null default 0,
  storage_key text not null,
  extracted_text text,
  status text not null default 'uploaded' check (status in ('uploaded','processing','ready','failed')),
  created_at timestamptz not null default now()
);

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  title text not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists quizzes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  title text not null,
  question_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists study_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references quizzes(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  score numeric not null default 0,
  correct integer not null default 0,
  attempted integer not null default 0,
  completed_at timestamptz not null default now()
);

create index if not exists courses_user_id_idx on courses(user_id);
create index if not exists materials_course_id_idx on materials(course_id);
create index if not exists notes_course_id_idx on notes(course_id);
create index if not exists attempts_user_id_idx on study_attempts(user_id);
