-- Toi et Moi Database Schema
-- Run in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Couples table
create table public.couples (
  id uuid default uuid_generate_v4() primary key,
  name text,
  anniversary_date date,
  invite_code text unique default encode(gen_random_bytes(6), 'hex'),
  created_at timestamp with time zone default now()
);

-- Couple members table
create table public.couple_members (
  id uuid default uuid_generate_v4() primary key,
  couple_id uuid references public.couples(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text check (role in ('owner', 'partner')) not null default 'owner',
  display_name text,
  nickname text,
  created_at timestamp with time zone default now(),
  unique(couple_id, user_id)
);

-- Memories table
create table public.memories (
  id uuid default uuid_generate_v4() primary key,
  couple_id uuid references public.couples(id) on delete cascade not null,
  title text not null,
  description text,
  date date not null default current_date,
  created_by uuid references auth.users(id) not null,
  created_at timestamp with time zone default now()
);

-- Memory photos table
create table public.memory_photos (
  id uuid default uuid_generate_v4() primary key,
  memory_id uuid references public.memories(id) on delete cascade not null,
  image_url text not null,
  created_at timestamp with time zone default now()
);

-- Events (calendar) table
create table public.events (
  id uuid default uuid_generate_v4() primary key,
  couple_id uuid references public.couples(id) on delete cascade not null,
  title text not null,
  date date not null,
  type text check (type in ('date', 'anniversary', 'birthday', 'other')) not null default 'other',
  created_by uuid references auth.users(id) not null,
  created_at timestamp with time zone default now()
);

-- Questions progress table
create table public.questions_progress (
  id uuid default uuid_generate_v4() primary key,
  couple_id uuid references public.couples(id) on delete cascade not null,
  question_index integer not null,
  completed_by uuid references auth.users(id),
  completed_at timestamp with time zone default now(),
  unique(couple_id, question_index)
);

-- Row Level Security
alter table public.couples enable row level security;
alter table public.couple_members enable row level security;
alter table public.memories enable row level security;
alter table public.memory_photos enable row level security;
alter table public.events enable row level security;
alter table public.questions_progress enable row level security;

-- Helper function: get couple_id for current user (security definer to avoid RLS recursion)
create or replace function public.get_my_couple_id()
returns uuid as $$
  select couple_id from public.couple_members
  where user_id = auth.uid()
  limit 1;
$$ language sql security definer stable;

-- Couples policies
create policy "Users can view their couple" on public.couples
  for select using (true);

create policy "Authenticated users can create couples" on public.couples
  for insert with check (auth.uid() is not null);

create policy "Members can update their couple" on public.couples
  for update using (id = public.get_my_couple_id());

-- Couple members policies
create policy "Members can view couple members" on public.couple_members
  for select using (couple_id = public.get_my_couple_id());

create policy "Authenticated users can join couples" on public.couple_members
  for insert with check (auth.uid() = user_id);

-- Memories policies
create policy "Members can view memories" on public.memories
  for select using (couple_id = public.get_my_couple_id());

create policy "Members can create memories" on public.memories
  for insert with check (couple_id = public.get_my_couple_id() and created_by = auth.uid());

create policy "Members can delete memories" on public.memories
  for delete using (couple_id = public.get_my_couple_id());

-- Memory photos policies
create policy "Members can view photos" on public.memory_photos
  for select using (
    memory_id in (select id from public.memories where couple_id = public.get_my_couple_id())
  );

create policy "Members can add photos" on public.memory_photos
  for insert with check (
    memory_id in (select id from public.memories where couple_id = public.get_my_couple_id())
  );

create policy "Members can delete photos" on public.memory_photos
  for delete using (
    memory_id in (select id from public.memories where couple_id = public.get_my_couple_id())
  );

-- Events policies
create policy "Members can view events" on public.events
  for select using (couple_id = public.get_my_couple_id());

create policy "Members can create events" on public.events
  for insert with check (couple_id = public.get_my_couple_id() and created_by = auth.uid());

create policy "Members can delete events" on public.events
  for delete using (couple_id = public.get_my_couple_id());

-- Questions progress policies
create policy "Members can view progress" on public.questions_progress
  for select using (couple_id = public.get_my_couple_id());

create policy "Members can update progress" on public.questions_progress
  for insert with check (couple_id = public.get_my_couple_id());

-- Storage bucket for memory photos
insert into storage.buckets (id, name, public) values ('memories', 'memories', true)
on conflict do nothing;

create policy "Authenticated users can upload" on storage.objects
  for insert with check (bucket_id = 'memories' and auth.uid() is not null);

create policy "Anyone can view memory images" on storage.objects
  for select using (bucket_id = 'memories');

create policy "Users can delete their uploads" on storage.objects
  for delete using (bucket_id = 'memories' and auth.uid() is not null);
