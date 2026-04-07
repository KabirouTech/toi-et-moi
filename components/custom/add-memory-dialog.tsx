'use client';

import { useState, useRef } from 'react';
import { createMemory } from '@/app/memories/actions';
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
import { Plus, ImageIcon } from 'lucide-react';

export function AddMemoryDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      urls.push(URL.createObjectURL(files[i]));
    }
    setPreviews(urls);
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await createMemory(formData);
      setOpen(false);
      setPreviews([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch {
      // Error handled by server action
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setPreviews([]);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <button className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-tr from-[#ffadf9] to-[#ff77ff] px-5 py-2.5 text-sm font-bold text-[#37003a] transition-shadow hover:shadow-[0_10px_30px_rgba(255,173,249,0.2)]">
            <Plus className="h-4 w-4" />
            Ajouter
          </button>
        }
      />
      <DialogContent className="border-white/[0.08] bg-[#21172d] sm:max-w-md sm:rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-[#ecddfb]">Créer un souvenir</DialogTitle>
          <DialogDescription className="text-[#d7c0d1]">
            Capturez un moment spécial partagé ensemble.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title" className="font-['Inter'] text-xs uppercase tracking-widest text-[#d7c0d1]">Titre</Label>
            <Input
              id="title"
              name="title"
              placeholder="Notre moment spécial..."
              required
              className="rounded-xl border-white/[0.08] bg-[#2f263c] text-[#ecddfb] placeholder:text-[#d7c0d1]/50 focus:border-[#ffadf9]/40"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description" className="font-['Inter'] text-xs uppercase tracking-widest text-[#d7c0d1]">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Racontez l'histoire..."
              rows={3}
              className="rounded-xl border-white/[0.08] bg-[#2f263c] text-[#ecddfb] placeholder:text-[#d7c0d1]/50 focus:border-[#ffadf9]/40"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="date" className="font-['Inter'] text-xs uppercase tracking-widest text-[#d7c0d1]">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              required
              className="rounded-xl border-white/[0.08] bg-[#2f263c] text-[#ecddfb] focus:border-[#ffadf9]/40"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="images" className="font-['Inter'] text-xs uppercase tracking-widest text-[#d7c0d1]">Photos</Label>
            <div
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-[#524250]/40 bg-[#3a3047]/10 p-6 transition-colors hover:border-[#ffadf9]/30"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="h-6 w-6 text-[#d7c0d1]/60" />
              <span className="text-xs text-[#d7c0d1]">Cliquez pour ajouter des photos</span>
            </div>
            <Input
              ref={fileInputRef}
              id="images"
              name="images"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {previews.length > 0 && (
            <div className="flex gap-2 overflow-x-auto rounded-2xl bg-[#2f263c]/50 p-2">
              {previews.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Preview ${i + 1}`}
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
              <>
                <ImageIcon className="h-4 w-4" />
                Enregistrer
              </>
            )}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
