import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getInviteUrl } from '@/lib/helpers';
import Link from 'next/link';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { CopyButton } from '@/components/custom/copy-button';

export default async function InvitePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: coupleMember } = await supabase
    .from('couple_members')
    .select('couple_id')
    .eq('user_id', user.id)
    .single();

  if (!coupleMember) {
    redirect('/setup');
  }

  const { data: couple } = await supabase
    .from('couples')
    .select('*')
    .eq('id', coupleMember.couple_id)
    .single();

  if (!couple) {
    redirect('/setup');
  }

  const inviteUrl = getInviteUrl(couple.invite_code);

  return (
    <div className="min-h-screen bg-[#180f24]">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-[#d7c0d1] transition-colors hover:text-[#ffadf9]"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>

        <div className="mt-8 flex flex-col items-center gap-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffadf9]/20 to-[#ff77ff]/20">
            <UserPlus className="h-8 w-8 text-[#ffadf9]" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-[#ecddfb]">
              Invitez votre partenaire
            </h1>
            <p className="mt-2 text-sm text-[#d7c0d1]">
              Partagez ce lien avec votre partenaire pour rejoindre votre espace.
            </p>
          </div>

          <div className="w-full rounded-[2rem] bg-white/5 backdrop-blur-[12px] border border-white/[0.08] p-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
              <code className="break-all text-sm text-[#ffadf9]">
                {inviteUrl}
              </code>
              <CopyButton text={inviteUrl} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
