'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateNickname(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const nickname = (formData.get('nickname') as string)?.trim() || null;
  const partnerId = formData.get('partnerId') as string;

  if (!partnerId) throw new Error('Partner ID required');

  // Verify the user and partner are in the same couple
  const { data: myMember } = await supabase
    .from('couple_members')
    .select('couple_id')
    .eq('user_id', user.id)
    .single();

  if (!myMember) throw new Error('No couple found');

  const { data: partnerMember } = await supabase
    .from('couple_members')
    .select('id, couple_id')
    .eq('user_id', partnerId)
    .eq('couple_id', myMember.couple_id)
    .single();

  if (!partnerMember) throw new Error('Partner not found in your couple');

  // Update the nickname on the partner's row
  // Each user sets the nickname FOR their partner (how they call them)
  // We store it on the current user's row as "nickname" = what I call my partner
  await supabase
    .from('couple_members')
    .update({ nickname })
    .eq('user_id', user.id)
    .eq('couple_id', myMember.couple_id);

  revalidatePath('/dashboard');
}
