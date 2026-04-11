-- Custom questions feature
-- Run in Supabase SQL Editor

create table public.custom_questions (
  id uuid default uuid_generate_v4() primary key,
  couple_id uuid references public.couples(id) on delete cascade not null,
  text text not null check (length(text) between 3 and 500),
  created_by uuid references auth.users(id) not null,
  created_at timestamp with time zone default now()
);

alter table public.custom_questions enable row level security;

create policy "Members can view custom questions" on public.custom_questions
  for select using (couple_id = public.get_my_couple_id());

create policy "Members can add custom questions" on public.custom_questions
  for insert with check (couple_id = public.get_my_couple_id() and created_by = auth.uid());

create policy "Members can delete custom questions" on public.custom_questions
  for delete using (couple_id = public.get_my_couple_id());

-- Extend questions_progress to track custom questions alongside built-in ones
alter table public.questions_progress
  add column custom_question_id uuid references public.custom_questions(id) on delete cascade;

alter table public.questions_progress
  alter column question_index drop not null;

alter table public.questions_progress
  drop constraint questions_progress_couple_id_question_index_key;

create unique index questions_progress_builtin_unique
  on public.questions_progress (couple_id, question_index)
  where question_index is not null;

create unique index questions_progress_custom_unique
  on public.questions_progress (couple_id, custom_question_id)
  where custom_question_id is not null;

alter table public.questions_progress
  add constraint questions_progress_one_source
  check (
    (question_index is not null and custom_question_id is null) or
    (question_index is null and custom_question_id is not null)
  );
