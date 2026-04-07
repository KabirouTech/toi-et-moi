import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { daysTogether } from '@/lib/helpers';
import { signOut } from '@/app/auth/actions';
import Link from 'next/link';
import {
  Heart,
  MessageCircle,
  Calendar,
  Camera,
  UserPlus,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { BottomNav } from '@/components/custom/bottom-nav';
import { NicknameDialog } from '@/components/custom/nickname-dialog';

const romanticQuestions = [
  'Quel moment vous a fait réaliser pour la première fois que vous tombiez amoureux(se) ?',
  'Quel est votre souvenir préféré de nous ensemble ?',
  'Si nous pouvions voyager n\'importe où demain, où voudriez-vous aller ?',
  'Quelle chanson vous fait penser à nous ?',
  'Qu\'aimez-vous le plus dans notre relation ?',
  'Qu\'est-ce que je fais qui vous fait toujours sourire ?',
  'Quel rêve voulez-vous que nous poursuivions ensemble ?',
  'Quelle a été la chose la plus inattendue en tombant amoureux(se) de moi ?',
  'Si vous pouviez revivre une journée passée ensemble, laquelle serait-ce ?',
  'Que représente le foyer pour vous ?',
  'Quel petit geste de ma part compte énormément pour vous ?',
  'Comment savez-vous quand vous vous sentez le plus aimé(e) ?',
  'Quelle aventure devrions-nous vivre ensuite ?',
  'Quelle est la chose que vous voulez que nous ne cessions jamais de faire ?',
  'À quoi ressemble notre avenir à vos yeux ?',
];

function getQuestionOfTheDay(): string {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  return romanticQuestions[dayOfYear % romanticQuestions.length];
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get couple_member row for the user
  const { data: coupleMember } = await supabase
    .from('couple_members')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!coupleMember) {
    redirect('/setup');
  }

  // Get the couple row
  const { data: couple } = await supabase
    .from('couples')
    .select('*')
    .eq('id', coupleMember.couple_id)
    .single();

  if (!couple) {
    redirect('/setup');
  }

  // Get partner's couple_member row
  const { data: partner } = await supabase
    .from('couple_members')
    .select('*')
    .eq('couple_id', couple.id)
    .neq('user_id', user.id)
    .single();

  const hasPartner = !!partner;
  const coupleName = couple.name || 'Votre espace';
  const days = couple.anniversary_date
    ? daysTogether(couple.anniversary_date)
    : null;
  const question = getQuestionOfTheDay();

  // Get display names
  const myName =
    coupleMember.display_name ||
    user.user_metadata?.display_name ||
    user.email?.split('@')[0] ||
    'You';

  const partnerRealName = partner?.display_name || 'Votre partenaire';
  // nickname = how I call my partner (stored on MY row)
  const partnerNickname: string | null = coupleMember.nickname ?? null;
  const partnerDisplayName = partnerNickname || partnerRealName;

  const navCards = [
    {
      href: '/questions',
      title: '36 Questions',
      description: 'Approfondissez votre lien',
      icon: MessageCircle,
      gradient: 'from-[#ffadf9]/20 to-[#ff77ff]/20',
    },
    {
      href: '/memories',
      title: 'Souvenirs',
      description: 'Chérissez vos moments',
      icon: Heart,
      gradient: 'from-[#ffadf9]/20 to-[#d4bbff]/20',
    },
    {
      href: '/calendar',
      title: 'Calendrier',
      description: 'Dates importantes',
      icon: Calendar,
      gradient: 'from-[#d4bbff]/20 to-[#ffadf9]/20',
    },
    {
      href: '/album',
      title: 'Album Photo',
      description: 'Google Photos partagé',
      icon: Camera,
      gradient: 'from-[#00A3FF]/20 to-[#d4bbff]/20',
    },
  ];

  if (!hasPartner) {
    navCards.push({
      href: '/invite',
      title: 'Inviter partenaire',
      description: 'Partagez votre espace',
      icon: UserPlus,
      gradient: 'from-[#d4bbff]/20 to-[#ff77ff]/20',
    });
  }

  return (
    <div className="min-h-screen bg-[#180f24]">
      <div className="mx-auto max-w-2xl px-4 py-8 pb-32 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-lg italic text-[#ffadf9]">Toi et Moi</p>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#ffadf9] to-[#ff77ff] text-xs font-bold text-[#37003a]">
              {myName.charAt(0).toUpperCase()}
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#d7c0d1] transition-colors hover:text-[#ffadf9]"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Se déconnecter</span>
              </button>
            </form>
          </div>
        </div>

        {/* Couple name + day counter */}
        <div className="mt-8">
          <h1 className="text-3xl font-bold tracking-tight text-[#ecddfb] sm:text-4xl">
            {coupleName}
          </h1>
          {days !== null && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#ffadf9]/10 border border-[#ffadf9]/20 px-4 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#ffadf9]" />
              <span className="text-sm font-medium text-[#ffadf9]">
                {days} {days === 1 ? 'jour' : 'jours'} ensemble
              </span>
            </div>
          )}
        </div>

        {/* Partner status */}
        {hasPartner ? (
          <div className="mt-6 flex items-center gap-4 rounded-[2rem] bg-white/5 backdrop-blur-[12px] border border-white/[0.08] px-5 py-4">
            <div className="flex -space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#ffadf9] to-[#ff77ff] text-sm font-bold text-[#37003a] border-4 border-[#180f24]">
                {myName.charAt(0).toUpperCase()}
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#d4bbff] to-[#ffadf9] text-sm font-bold text-[#37003a] border-4 border-[#180f24]">
                {partnerDisplayName!.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <NicknameDialog
                partnerId={partner!.user_id}
                partnerDisplayName={partnerRealName}
                currentNickname={partnerNickname}
              >
                <p className="text-sm font-medium text-[#ecddfb] transition-colors hover:text-[#ffadf9]">
                  {myName} & {partnerDisplayName}
                  {partnerNickname && (
                    <span className="ml-1.5 text-xs text-[#d7c0d1]">
                      ({partnerRealName})
                    </span>
                  )}
                </p>
              </NicknameDialog>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ffadf9] shadow-[0_0_8px_#ffadf9]" />
                <span className="text-xs text-[#d7c0d1]">Connectés</span>
              </div>
            </div>
          </div>
        ) : (
          <Link href="/invite" className="group mt-6 block">
            <div className="flex items-center gap-4 rounded-[2rem] bg-white/5 backdrop-blur-[12px] border border-dashed border-[#524250]/40 px-5 py-4 transition-all group-hover:border-[#ffadf9]/30 group-hover:bg-white/[0.08]">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2f263c]">
                <UserPlus className="h-5 w-5 text-[#d7c0d1]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#ecddfb]">
                  En attente de votre partenaire
                </p>
                <p className="text-xs text-[#d7c0d1]">
                  Appuyez pour partager votre lien d&apos;invitation
                </p>
              </div>
            </div>
          </Link>
        )}

        {/* Question of the Day */}
        <div className="mt-6 rounded-[2rem] bg-white/5 backdrop-blur-[20px] border border-white/5 shadow-[inset_2px_2px_10px_rgba(255,173,249,0.1)] shadow-[0_20px_40px_rgba(255,173,249,0.08)] p-6">
          <p className="font-['Inter'] text-xs uppercase tracking-widest text-[#d7c0d1] flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#ffadf9]" />
            Question du jour
          </p>
          <p className="mt-4 text-lg font-medium leading-relaxed text-[#ecddfb]/90">
            {question}
          </p>
        </div>

        {/* Bento Grid */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
          {navCards.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="group">
                <div className="aspect-square rounded-[2rem] bg-white/5 backdrop-blur-[12px] border border-white/[0.08] p-5 flex flex-col items-center justify-center gap-4 transition-all duration-300 hover:bg-white/[0.08] hover:shadow-[0_20px_40px_rgba(255,173,249,0.08)]">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} transition-transform duration-200 group-hover:scale-110`}
                  >
                    <Icon className="h-6 w-6 text-[#ffadf9]" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-[#ecddfb]">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-xs text-[#d7c0d1]">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <BottomNav active="dashboard" />
    </div>
  );
}
