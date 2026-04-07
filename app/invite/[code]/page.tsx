import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Heart } from 'lucide-react';

export default async function InviteCodePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const supabase = await createClient();

  // Look up couple by invite code
  const { data: couple } = await supabase
    .from('couples')
    .select('*')
    .eq('invite_code', code)
    .single();

  if (!couple) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#180f24] px-4">
        <div className="w-full max-w-sm rounded-[2rem] bg-white/5 backdrop-blur-[12px] border border-white/[0.08] p-8 text-center">
          <p className="text-lg font-semibold text-[#ecddfb]">Invitation invalide</p>
          <p className="mt-2 text-sm text-[#d7c0d1]">
            Ce lien d&apos;invitation n&apos;est pas valide ou a expiré.
          </p>
        </div>
      </div>
    );
  }

  // Check if user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/signup?invite=${code}`);
  }

  // Check if user is already a member of this couple
  const { data: existingMember } = await supabase
    .from('couple_members')
    .select('id')
    .eq('couple_id', couple.id)
    .eq('user_id', user.id)
    .single();

  if (existingMember) {
    redirect('/dashboard');
  }

  // Check if user is already in another couple
  const { data: otherMembership } = await supabase
    .from('couple_members')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (otherMembership) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#180f24] px-4">
        <div className="w-full max-w-sm rounded-[2rem] bg-white/5 backdrop-blur-[12px] border border-white/[0.08] p-8 text-center">
          <p className="text-lg font-semibold text-[#ecddfb]">Déjà en couple</p>
          <p className="mt-2 text-sm text-[#d7c0d1]">
            Vous êtes déjà membre d&apos;un autre espace couple.
          </p>
        </div>
      </div>
    );
  }

  async function joinCouple() {
    'use server';

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect('/auth/login');
    }

    const displayName =
      user.user_metadata?.display_name || user.email?.split('@')[0] || 'Partner';

    await supabase.from('couple_members').insert({
      couple_id: couple!.id,
      user_id: user.id,
      role: 'partner',
      display_name: displayName,
    });

    revalidatePath('/dashboard');
    redirect('/dashboard');
  }

  const coupleName = couple.name || 'un espace partagé';

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#180f24] px-4">
      <div className="w-full max-w-sm rounded-[2rem] bg-white/5 backdrop-blur-[12px] border border-white/[0.08] shadow-[0_20px_40px_rgba(255,173,249,0.08)] p-8">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffadf9]/20 to-[#ff77ff]/20">
            <Heart className="h-7 w-7 text-[#ffadf9]" />
          </div>
          <div>
            <p className="text-lg font-semibold text-[#ecddfb]">
              Rejoindre {coupleName} ?
            </p>
            <p className="mt-1 text-sm text-[#d7c0d1]">
              Vous avez été invité(e) à rejoindre cet espace couple.
            </p>
          </div>
          <form action={joinCouple} className="w-full">
            <button
              type="submit"
              className="w-full rounded-full bg-gradient-to-tr from-[#ffadf9] to-[#ff77ff] px-6 py-3 text-sm font-bold text-[#37003a] transition-shadow hover:shadow-[0_10px_30px_rgba(255,173,249,0.2)]"
            >
              Rejoindre
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
