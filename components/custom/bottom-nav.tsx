'use client';

import Link from 'next/link';
import { Home, Sparkles, Calendar, Heart } from 'lucide-react';

const navItems = [
  { key: 'dashboard', href: '/dashboard', icon: Home, label: 'Accueil' },
  { key: 'questions', href: '/questions', icon: Sparkles, label: 'Questions' },
  { key: 'calendar', href: '/calendar', icon: Calendar, label: 'Calendrier' },
  { key: 'memories', href: '/memories', icon: Heart, label: 'Souvenirs' },
] as const;

type NavKey = (typeof navItems)[number]['key'];

export function BottomNav({ active }: { active: NavKey }) {
  return (
    <nav className="fixed bottom-6 left-1/2 z-50 flex h-20 w-[90%] max-w-md -translate-x-1/2 items-center justify-around rounded-full bg-[#130a1f]/40 backdrop-blur-2xl border border-white/10 shadow-[0_20px_40px_rgba(255,173,249,0.08)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.key;

        return (
          <Link
            key={item.key}
            href={item.href}
            className="flex flex-col items-center gap-1"
          >
            {isActive ? (
              <span className="flex items-center justify-center rounded-full bg-gradient-to-tr from-[#ffadf9] to-[#ff77ff] p-3 text-[#130a1f]">
                <Icon className="h-5 w-5" />
              </span>
            ) : (
              <span className="flex items-center justify-center p-3 text-[#d4bbff] transition-colors hover:text-[#ffadf9]">
                <Icon className="h-5 w-5" />
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
