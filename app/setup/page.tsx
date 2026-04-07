import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { createCoupleSpace } from './actions';

export default async function SetupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-[#130a1f] px-4">
      {/* Celestial orbs */}
      <div className="pointer-events-none absolute top-[15%] left-[20%] h-[350px] w-[350px] rounded-full bg-[#ff77ff] opacity-[0.07] blur-[100px]" />
      <div className="pointer-events-none absolute bottom-[20%] right-[15%] h-[300px] w-[300px] rounded-full bg-[#d4bbff] opacity-[0.06] blur-[100px]" />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center">
        {/* Brand */}
        <span className="mb-8 text-2xl font-light italic text-[#ffadf9]">
          Toi et Moi
        </span>

        <Card className="w-full rounded-[2rem] border-white/[0.08] bg-white/5 backdrop-blur-[24px]">
          <CardHeader className="pb-2 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-[#ecddfb]">
              Créez votre espace
            </h1>
            <p className="mt-1 text-sm text-[#d7c0d1]/70">
              Configurez votre espace couple pour commencer
            </p>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                {error}
              </div>
            )}

            <form action={createCoupleSpace} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="couple_name"
                  className="font-['Inter'] text-xs uppercase tracking-widest text-[#d7c0d1]"
                >
                  Nom du couple
                </Label>
                <Input
                  id="couple_name"
                  name="couple_name"
                  type="text"
                  placeholder='ex. "Jean & Marie"'
                  autoComplete="off"
                  className="rounded-xl border-white/10 bg-[#3a3047]/40 text-[#ecddfb] placeholder:text-[#d7c0d1]/30 focus:border-[#ffadf9]/30 focus-visible:ring-[#ffadf9]/20"
                />
                <p className="text-xs text-[#d7c0d1]/40">
                  Optionnel. Vous pourrez le changer plus tard.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="anniversary"
                  className="font-['Inter'] text-xs uppercase tracking-widest text-[#d7c0d1]"
                >
                  Date anniversaire
                </Label>
                <Input
                  id="anniversary"
                  name="anniversary"
                  type="date"
                  required
                  className="rounded-xl border-white/10 bg-[#3a3047]/40 text-[#ecddfb] placeholder:text-[#d7c0d1]/30 focus:border-[#ffadf9]/30 focus-visible:ring-[#ffadf9]/20"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="mt-2 w-full rounded-full bg-gradient-to-tr from-[#ffadf9] to-[#ff77ff] font-bold text-[#37003a] shadow-[0_10px_20px_rgba(255,119,255,0.2)] transition-all hover:shadow-[0_14px_28px_rgba(255,119,255,0.3)] hover:brightness-110"
              >
                Commencer votre voyage
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
