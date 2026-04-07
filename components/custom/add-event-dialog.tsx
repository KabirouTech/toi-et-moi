'use client';

import { useState, useTransition } from 'react';
import { createEvent } from '@/app/calendar/actions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

export function AddEventDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await createEvent(formData);
        setOpen(false);
      } catch {
        // Error handled by server action
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-tr from-[#ffadf9] to-[#ff77ff] px-5 py-2.5 text-sm font-bold text-[#37003a] transition-shadow hover:shadow-[0_10px_30px_rgba(255,173,249,0.2)]">
            <Plus className="h-4 w-4" />
            Ajouter
          </button>
        }
      />
      <DialogContent className="border-white/[0.08] bg-[#21172d] sm:rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-[#ecddfb]">Ajouter un événement</DialogTitle>
          <DialogDescription className="text-[#d7c0d1]">
            Ajoutez une date importante à votre calendrier partagé.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="title" className="font-['Inter'] text-xs uppercase tracking-widest text-[#d7c0d1]">Titre</Label>
            <Input
              id="title"
              name="title"
              placeholder="Dîner de la Saint-Valentin"
              required
              className="rounded-xl border-white/[0.08] bg-[#2f263c] text-[#ecddfb] placeholder:text-[#d7c0d1]/50 focus:border-[#ffadf9]/40"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="date" className="font-['Inter'] text-xs uppercase tracking-widest text-[#d7c0d1]">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              required
              className="rounded-xl border-white/[0.08] bg-[#2f263c] text-[#ecddfb] focus:border-[#ffadf9]/40"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type" className="font-['Inter'] text-xs uppercase tracking-widest text-[#d7c0d1]">Type</Label>
            <select
              id="type"
              name="type"
              required
              className="h-10 w-full rounded-xl border border-white/[0.08] bg-[#2f263c] px-3 py-2 text-sm text-[#ecddfb] outline-none focus:border-[#ffadf9]/40"
              defaultValue="date"
            >
              <option value="date">Rendez-vous</option>
              <option value="anniversary">Anniversaire</option>
              <option value="birthday">Anniversaire (naissance)</option>
              <option value="other">Autre</option>
            </select>
          </div>
          <DialogFooter>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-tr from-[#ffadf9] to-[#ff77ff] px-5 py-3 text-sm font-bold text-[#37003a] transition-shadow hover:shadow-[0_10px_30px_rgba(255,173,249,0.2)] disabled:opacity-50"
            >
              {isPending ? 'Ajout...' : 'Ajouter un événement'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
