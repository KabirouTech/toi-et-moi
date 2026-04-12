-- Allow couple members to update their memories
-- Run in Supabase SQL Editor

create policy "Members can update memories" on public.memories
  for update using (couple_id = public.get_my_couple_id());
