'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function markQuestionCompleted(questionIndex: number) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data: coupleMember } = await supabase
    .from('couple_members')
    .select('couple_id')
    .eq('user_id', user.id)
    .single();

  if (!coupleMember) {
    throw new Error('No couple found');
  }

  const { error } = await supabase.from('questions_progress').insert({
    couple_id: coupleMember.couple_id,
    question_index: questionIndex,
    completed_by: user.id,
  });

  if (error) {
    // If already completed (unique constraint), that's fine
    if (error.code !== '23505') {
      throw new Error('Failed to mark question as completed');
    }
  }

  revalidatePath('/questions');
}
