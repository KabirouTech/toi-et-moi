import Link from 'next/link';
import { ArrowRight, Calendar, Heart, MessageCircle } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const essentials = [
  {
    title: 'Parler',
    description: 'Une bonne question au bon moment, sans en faire trop.',
    icon: MessageCircle,
  },
  {
    title: 'Se souvenir',
    description: 'Photos, moments et gestes qui comptent vraiment.',
    icon: Heart,
  },
  {
    title: 'Prévoir',
    description: 'Quelques repères utiles pour ne pas laisser filer.',
    icon: Calendar,
  },
];

export default function Home() {
  return (
    <div className="relative isolate min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(255,173,249,0.14),_transparent_52%)]" />
      <div className="pointer-events-none absolute right-0 top-24 h-72 w-72 rounded-full bg-[#7f5dff]/8 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full bg-[#ff7de8]/8 blur-[140px]" />

      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-xl font-light italic tracking-tight text-[#ffb0f4]"
        >
          Toi et Moi
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/auth/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-[#d7c0d1] transition-colors hover:text-[#fff2ff]"
          >
            Se connecter
          </Link>
          <Link
            href="/auth/signup"
            className={cn(
              buttonVariants({ size: 'lg' }),
              'h-10 rounded-full bg-white/[0.06] px-5 text-sm font-semibold text-[#f9efff] ring-1 ring-white/10 transition-all hover:bg-white/[0.1]'
            )}
          >
            Créer un espace
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-20 pt-8 sm:px-6 lg:px-8 lg:pt-12">
        <section className="surface-panel rounded-[2.5rem] px-6 py-12 sm:px-10 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="section-kicker">Un espace simple pour deux</p>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight text-[#f5e9ff] sm:text-6xl">
              Rester proches, sans en faire trop.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#d7c0d1] sm:text-lg">
              Quand les journées débordent, la relation passe souvent après tout
              le reste. Toi et Moi vous aide simplement à reprendre le fil.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/auth/signup"
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'h-12 rounded-full bg-gradient-to-r from-[#ffadf9] via-[#f793ff] to-[#ff77ff] px-6 text-base font-bold text-[#37003a] shadow-[0_18px_50px_rgba(255,119,255,0.22)] transition-all hover:-translate-y-0.5 hover:bg-transparent hover:text-[#37003a]'
                )}
              >
                Créer notre espace
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/auth/login"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'h-12 rounded-full border-white/10 bg-white/[0.03] px-6 text-base text-[#f2e6ff] hover:bg-white/[0.08]'
                )}
              >
                Reprendre notre espace
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-6">
          <div className="grid gap-3 md:grid-cols-3">
            {essentials.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="surface-panel-soft rounded-[1.75rem] p-5"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ffadf9]/10 text-[#ffadf9]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="mt-4 text-base font-semibold text-[#f5e9ff]">
                    {item.title}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[#baa6cd]">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

          <p className="mx-auto mt-6 max-w-2xl text-center text-sm leading-7 text-[#bda7d0]">
            Pensé pour les couples qui vivent dans le réel: pas toujours
            disponibles, pas toujours synchrones, mais toujours concernés.
          </p>
        </section>
      </main>
    </div>
  );
}
