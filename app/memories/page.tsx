import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ImageIcon } from 'lucide-react';
import { AddMemoryDialog } from '@/components/custom/add-memory-dialog';
import { MemoryCard } from '@/components/custom/memory-card';
import { BottomNav } from '@/components/custom/bottom-nav';

export default async function MemoriesPage() {
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

  const { data: memories } = await supabase
    .from('memories')
    .select('*')
    .eq('couple_id', coupleMember.couple_id)
    .order('date', { ascending: false });

  // Fetch photos for each memory
  const memoriesWithPhotos = await Promise.all(
    (memories ?? []).map(async (memory) => {
      const { data: photos } = await supabase
        .from('memory_photos')
        .select('*')
        .eq('memory_id', memory.id)
        .order('created_at', { ascending: true });

      return {
        ...memory,
        photos: photos ?? [],
        coverPhoto: photos?.[0]?.image_url ?? null,
      };
    })
  );

  return (
    <div className="min-h-screen bg-[#180f24]">
      <div className="mx-auto max-w-2xl px-4 py-8 pb-32 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold italic tracking-tight text-[#ecddfb] sm:text-4xl">
              Souvenirs
            </h1>
            <p className="mt-1 text-sm text-[#d7c0d1]">
              Vos moments précieux ensemble
            </p>
          </div>
          <AddMemoryDialog />
        </div>

        {/* Memory grid or empty state */}
        <div className="mt-8">
          {memoriesWithPhotos.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffadf9]/20 to-[#ff77ff]/20">
                <ImageIcon className="h-7 w-7 text-[#d7c0d1]/60" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#ecddfb]/80">
                  Aucun souvenir pour l&apos;instant
                </p>
                <p className="mt-1 text-xs text-[#d7c0d1]">
                  Commencez à capturer vos moments ensemble.
                </p>
              </div>
            </div>
          ) : (
            <div className="columns-2 gap-3 space-y-3 sm:gap-4 sm:space-y-4">
              {memoriesWithPhotos.map((memory) => (
                <MemoryCard
                  key={memory.id}
                  memory={memory}
                  coverPhoto={memory.coverPhoto}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav active="memories" />
    </div>
  );
}
