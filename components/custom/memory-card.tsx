'use client';

import { deleteMemory } from '@/app/memories/actions';
import { EditMemoryDialog } from '@/components/custom/edit-memory-dialog';
import { formatRelativeDate } from '@/lib/helpers';
import { Trash2, ImageIcon } from 'lucide-react';
import { useState } from 'react';

interface Photo {
  id: string;
  image_url: string;
}

interface MemoryCardProps {
  memory: {
    id: string;
    title: string;
    description: string | null;
    date: string;
  };
  coverPhoto: string | null;
  photos: Photo[];
}

export function MemoryCard({ memory, coverPhoto, photos }: MemoryCardProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(formData: FormData) {
    setDeleting(true);
    await deleteMemory(formData);
    setDeleting(false);
  }

  return (
    <div className="group relative break-inside-avoid overflow-hidden rounded-3xl bg-white/5 backdrop-blur-[12px] border border-white/[0.08] transition-all duration-300 hover:shadow-[0_20px_60px_rgba(255,173,249,0.1)]">
      <div className="relative w-full overflow-hidden">
        {coverPhoto ? (
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={coverPhoto}
              alt={memory.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#130a1f] via-transparent to-transparent" />
          </div>
        ) : (
          <div className="flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-br from-[#ffadf9]/10 via-[#21172d] to-[#d4bbff]/10">
            <ImageIcon className="h-10 w-10 text-[#d7c0d1]/40" />
          </div>
        )}

        <div className="absolute right-2 top-2 flex gap-1.5">
          <EditMemoryDialog memory={memory} photos={photos} />

          <form action={handleDelete}>
            <input type="hidden" name="memoryId" value={memory.id} />
            <button
              type="submit"
              disabled={deleting}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#180f24]/70 text-[#d7c0d1] opacity-100 backdrop-blur-sm transition-all hover:bg-red-500/30 hover:text-red-400 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <Trash2 className="h-3 w-3" />
              <span className="sr-only">Supprimer le souvenir</span>
            </button>
          </form>
        </div>
      </div>

      <div className="flex flex-col gap-1 p-4">
        <h3 className="truncate text-sm font-semibold leading-tight text-[#ecddfb]">
          {memory.title}
        </h3>
        <p className="text-xs text-[#d7c0d1]">
          {formatRelativeDate(memory.date)}
        </p>
        {memory.description && (
          <p className="line-clamp-2 text-xs text-[#ecddfb]/70">
            {memory.description}
          </p>
        )}
      </div>
    </div>
  );
}
