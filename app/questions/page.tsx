import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { QUESTIONS } from '@/lib/questions';
import { QuestionsCarousel } from '@/components/custom/questions-carousel';
import { BottomNav } from '@/components/custom/bottom-nav';

export default async function QuestionsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: coupleMember } = await supabase
    .from('couple_members')
    .select('couple_id, display_name')
    .eq('user_id', user.id)
    .single();

  if (!coupleMember) {
    redirect('/setup');
  }

  // Fetch partner info
  const { data: partner } = await supabase
    .from('couple_members')
    .select('display_name')
    .eq('couple_id', coupleMember.couple_id)
    .neq('user_id', user.id)
    .single();

  const { data: progress } = await supabase
    .from('questions_progress')
    .select('question_index, completed_by')
    .eq('couple_id', coupleMember.couple_id)
    .order('completed_at', { ascending: false });

  const completedIndices = (progress ?? []).map((p) => p.question_index);
  const lastCompletedBy = progress?.[0]?.completed_by ?? null;

  return (
    <div className="min-h-screen bg-[#180f24]">
      <div className="mx-auto max-w-2xl px-4 py-8 pb-32 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold italic tracking-tight text-[#ecddfb] sm:text-4xl">
            36 Questions
          </h1>
          <p className="mt-1 text-sm text-[#d7c0d1]">
            Qui mènent à l&apos;amour
          </p>
        </div>

        {/* Interactive Carousel */}
        <QuestionsCarousel
          coupleId={coupleMember.couple_id}
          userId={user.id}
          displayName={coupleMember.display_name}
          partnerName={partner?.display_name ?? null}
          questions={QUESTIONS}
          completedIndices={completedIndices}
          lastCompletedBy={lastCompletedBy}
        />
      </div>

      <BottomNav active="questions" />
    </div>
  );
}
