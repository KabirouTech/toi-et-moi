'use client';

import { useState } from 'react';
import { updateNickname } from '@/app/dashboard/actions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart } from 'lucide-react';

interface NicknameDialogProps {
  partnerId: string;
  partnerDisplayName: string;
  currentNickname: string | null;
  children: React.ReactNode;
}

export function NicknameDialog({
  partnerId,
  partnerDisplayName,
  currentNickname,
  children,
}: NicknameDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await updateNickname(formData);
      setOpen(false);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<button className="w-full min-w-0 overflow-hidden text-left" />}
      >
        {children}
      </DialogTrigger>
      <DialogContent className="rounded-[2rem] border-white/[0.08] bg-[#21172d] backdrop-blur-[24px] sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-[#ecddfb]">Petit nom</DialogTitle>
          <DialogDescription className="text-[#d7c0d1]">
            Choisissez un surnom pour {partnerDisplayName}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <input type="hidden" name="partnerId" value={partnerId} />
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="nickname"
              className="font-['Inter'] text-xs uppercase tracking-widest text-[#d7c0d1]"
            >
              Surnom
            </Label>
            <Input
              id="nickname"
              name="nickname"
              type="text"
              defaultValue={currentNickname ?? ''}
              placeholder="Mon cœur, Bébé, Chéri(e)..."
              className="rounded-xl border-white/10 bg-[#3a3047]/40 text-[#ecddfb] placeholder:text-[#d7c0d1]/40 focus:border-[#ffadf9]/30"
            />
            <p className="text-xs text-[#d7c0d1]/60">
              Laissez vide pour utiliser le prénom
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gradient-to-tr from-[#ffadf9] to-[#ff77ff] py-3 text-sm font-bold text-[#37003a] transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              'Enregistrement...'
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5" />
                Enregistrer
              </span>
            )}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
