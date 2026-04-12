'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { updateMemory } from '@/app/memories/actions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, ImageIcon, X } from 'lucide-react';
import { getImageUploadHint, validateImageUpload } from '@/lib/image-upload';

interface Photo {
  id: string;
  image_url: string;
}

interface EditMemoryDialogProps {
  memory: {
    id: string;
    title: string;
    description: string | null;
    date: string;
  };
  photos: Photo[];
}

export function EditMemoryDialog({ memory, photos }: EditMemoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [removedPhotoIds, setRemovedPhotoIds] = useState<Set<string>>(
    new Set()
  );
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const visiblePhotos = photos.filter((p) => !removedPhotoIds.has(p.id));

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    const selectedFiles = Array.from(files);
    const validationError = validateImageUpload(selectedFiles);

    if (validationError) {
      toast.error(validationError);
      e.target.value = '';
      setNewPreviews([]);
      return;
    }

    setNewPreviews(selectedFiles.map((f) => URL.createObjectURL(f)));
  }

  function handleRemovePhoto(photoId: string) {
    setRemovedPhotoIds((prev) => new Set([...prev, photoId]));
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      formData.set('memoryId', memory.id);

      for (const id of removedPhotoIds) {
        formData.append('removedPhotoIds', id);
      }

      const newFiles = fileInputRef.current?.files;
      if (newFiles) {
        for (const file of Array.from(newFiles)) {
          formData.append('newImages', file);
        }
      }

      const newImages = (formData.getAll('newImages') as File[]).filter(
        (image) => image && image.size > 0
      );
      if (newImages.length > 0) {
        const validationError = validateImageUpload(newImages);
        if (validationError) {
          toast.error(validationError);
          return;
        }
      }

      await updateMemory(formData);
      router.refresh();
      setOpen(false);
      toast.success('Souvenir mis à jour.');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'La mise à jour a échoué.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setRemovedPhotoIds(new Set());
      setNewPreviews([]);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <button className="flex h-7 w-7 items-center justify-center rounded-full bg-[#180f24]/70 text-[#d7c0d1] opacity-100 backdrop-blur-sm transition-all hover:bg-[#ffadf9]/30 hover:text-[#fff0ff] sm:opacity-0 sm:group-hover:opacity-100">
            <Pencil className="h-3 w-3" />
            <span className="sr-only">Modifier le souvenir</span>
          </button>
        }
      />
      <DialogContent className="max-h-[90vh] overflow-y-auto border-white/[0.08] bg-[#21172d] sm:max-w-md sm:rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-[#ecddfb]">
            Modifier le souvenir
          </DialogTitle>
          <DialogDescription className="text-[#d7c0d1]">
            Mettez à jour les détails ou les photos de ce moment.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="edit-title"
              className="font-['Inter'] text-xs uppercase tracking-widest text-[#d7c0d1]"
            >
              Titre
            </Label>
            <Input
              id="edit-title"
              name="title"
              defaultValue={memory.title}
              required
              className="rounded-xl border-white/[0.08] bg-[#2f263c] text-[#ecddfb] placeholder:text-[#d7c0d1]/50 focus:border-[#ffadf9]/40"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="edit-description"
              className="font-['Inter'] text-xs uppercase tracking-widest text-[#d7c0d1]"
            >
              Description
            </Label>
            <Textarea
              id="edit-description"
              name="description"
              defaultValue={memory.description ?? ''}
              rows={3}
              className="rounded-xl border-white/[0.08] bg-[#2f263c] text-[#ecddfb] placeholder:text-[#d7c0d1]/50 focus:border-[#ffadf9]/40"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="edit-date"
              className="font-['Inter'] text-xs uppercase tracking-widest text-[#d7c0d1]"
            >
              Date
            </Label>
            <Input
              id="edit-date"
              name="date"
              type="date"
              defaultValue={memory.date}
              required
              className="rounded-xl border-white/[0.08] bg-[#2f263c] text-[#ecddfb] focus:border-[#ffadf9]/40"
            />
          </div>

          {visiblePhotos.length > 0 && (
            <div className="flex flex-col gap-2">
              <Label className="font-['Inter'] text-xs uppercase tracking-widest text-[#d7c0d1]">
                Photos existantes
              </Label>
              <div className="flex flex-wrap gap-2">
                {visiblePhotos.map((photo) => (
                  <div key={photo.id} className="group/photo relative">
                    <img
                      src={photo.image_url}
                      alt=""
                      className="h-16 w-16 rounded-xl object-cover ring-1 ring-white/10"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(photo.id)}
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition-transform hover:scale-110"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label className="font-['Inter'] text-xs uppercase tracking-widest text-[#d7c0d1]">
              Ajouter des photos
            </Label>
            <div
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-[#524250]/40 bg-[#3a3047]/10 p-6 transition-colors hover:border-[#ffadf9]/30"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="h-6 w-6 text-[#d7c0d1]/60" />
              <span className="text-xs text-[#d7c0d1]">
                Cliquez pour ajouter des photos
              </span>
              <span className="text-center text-[11px] leading-5 text-[#a995bd]">
                {getImageUploadHint()}
              </span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {newPreviews.length > 0 && (
            <div className="flex gap-2 overflow-x-auto rounded-2xl bg-[#2f263c]/50 p-2">
              {newPreviews.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Aperçu ${i + 1}`}
                  className="h-16 w-16 shrink-0 rounded-xl object-cover ring-1 ring-white/10"
                />
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-tr from-[#ffadf9] to-[#ff77ff] px-5 py-3 text-sm font-bold text-[#37003a] transition-shadow hover:shadow-[0_10px_30px_rgba(255,173,249,0.2)] disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#37003a] border-t-transparent" />
                Enregistrement...
              </>
            ) : (
              'Enregistrer les modifications'
            )}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
