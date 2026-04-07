import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Mail } from 'lucide-react';

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

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
          <CardHeader className="flex flex-col items-center pb-2 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-[#ffadf9]/20 to-[#ff77ff]/20">
              <Mail className="h-8 w-8 text-[#ffadf9]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#ecddfb]">
              Vérifiez votre email
            </h1>
            <p className="mt-1 text-sm text-[#d7c0d1]/70">
              Nous avons envoyé un lien de vérification à
            </p>
            {email && (
              <p className="mt-1 font-medium text-[#ffadf9]">{email}</p>
            )}
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 text-center">
            <p className="text-sm leading-relaxed text-[#d7c0d1]/50">
              Cliquez sur le lien dans l&apos;email pour vérifier votre compte, puis revenez vous connecter.
            </p>
            <Button
              size="lg"
              className="mt-2 w-full rounded-full bg-gradient-to-tr from-[#ffadf9] to-[#ff77ff] font-bold text-[#37003a] shadow-[0_10px_20px_rgba(255,119,255,0.2)] transition-all hover:shadow-[0_14px_28px_rgba(255,119,255,0.3)] hover:brightness-110"
              render={<Link href="/auth/login" />}
            >
              Aller à la connexion
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
