import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ImageIcon } from 'lucide-react';
import { BottomNav } from '@/components/custom/bottom-nav';
import { AlbumGallery } from '@/components/custom/album-gallery';

export default async function AlbumPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: coupleMember } = await supabase
    .from('couple_members')
    .select('*')
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

  // Check if user has connected Google Photos
  const { data: tokenRow } = await supabase
    .from('google_photos_tokens')
    .select('id')
    .eq('user_id', user.id)
    .single();

  const isConnected = !!tokenRow;
  const albumUrl = couple.google_album_url || null;

  return (
    <div className="min-h-screen bg-[#180f24]">
      <div className="mx-auto max-w-2xl px-4 py-8 pb-32 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-[#d7c0d1] transition-colors hover:bg-white/10 hover:text-[#ffadf9]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#ecddfb]">
              Album Photo
            </h1>
            <p className="text-xs text-[#d7c0d1]">
              Google Photos partagé
            </p>
          </div>
        </div>

        {!isConnected ? (
          /* Connect Google Photos card */
          <div className="mt-10 flex flex-col items-center rounded-[2rem] bg-white/5 backdrop-blur-[12px] border border-white/[0.08] p-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#ffadf9]/20 to-[#d4bbff]/20">
              <ImageIcon className="h-10 w-10 text-[#ffadf9]" />
            </div>
            <h2 className="mt-6 text-lg font-semibold text-[#ecddfb]">
              Connectez Google Photos
            </h2>
            <p className="mt-2 text-sm text-[#d7c0d1] max-w-xs">
              Partagez vos plus beaux moments ensemble dans un album commun.
            </p>
            <a
              href="/api/google-photos/connect"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-tr from-[#ffadf9] to-[#ff77ff] px-8 py-3 text-sm font-bold text-[#37003a] transition-transform hover:scale-105"
            >
              Connecter Google Photos
            </a>
          </div>
        ) : (
          /* Gallery */
          <AlbumGallery albumUrl={albumUrl} />
        )}
      </div>

      <BottomNav active="memories" />
    </div>
  );
}
