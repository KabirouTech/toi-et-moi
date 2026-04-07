'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { markQuestionCompleted } from '@/app/questions/actions';
import { toast } from 'sonner';
import type { Question } from '@/lib/questions';

interface QuestionsCarouselProps {
  coupleId: string;
  userId: string;
  displayName: string;
  partnerName: string | null;
  questions: Question[];
  completedIndices: number[];
  lastCompletedBy: string | null;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function QuestionsCarousel({
  coupleId,
  userId,
  displayName,
  partnerName,
  questions,
  completedIndices: initialCompletedIndices,
  lastCompletedBy: initialLastCompletedBy,
}: QuestionsCarouselProps) {
  const [partnerPresent, setPartnerPresent] = useState(false);
  const [partnerLeft, setPartnerLeft] = useState(false);
  const [completedSet, setCompletedSet] = useState<Set<number>>(
    () => new Set(initialCompletedIndices)
  );
  // Track whose turn it is: the person who did NOT complete the last question
  const [lastMarkedBy, setLastMarkedBy] = useState<string | null>(initialLastCompletedBy);

  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null);
  const partnerWasPresent = useRef(false);

  // Find the first uncompleted question index position
  const initialPosition = useMemo(() => {
    const idx = questions.findIndex((q) => !initialCompletedIndices.includes(q.index));
    return idx === -1 ? 0 : idx;
  }, [questions, initialCompletedIndices]);

  const [currentPosition, setCurrentPosition] = useState(initialPosition);
  const [direction, setDirection] = useState(0);

  const currentQuestion = questions[currentPosition];
  const isCompleted = completedSet.has(currentQuestion.index);
  const activeSet = currentQuestion.set;

  // Turn logic: it's my turn if the last person to mark was NOT me (or no one marked yet)
  const isMyTurn = lastMarkedBy === null || lastMarkedBy !== userId;

  // Set up Supabase Realtime channel
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`questions:${coupleId}`);
    channelRef.current = channel;

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const users = Object.values(state).flat() as unknown as Array<{ user_id: string }>;
      const otherPresent = users.some((u) => u.user_id !== userId);

      if (otherPresent) {
        setPartnerPresent(true);
        setPartnerLeft(false);
        partnerWasPresent.current = true;
      } else if (partnerWasPresent.current) {
        setPartnerPresent(false);
        setPartnerLeft(true);
        toast.info('Votre partenaire s\u2019est d\u00e9connect\u00e9(e)');
      } else {
        setPartnerPresent(false);
      }
    });

    channel.on('broadcast', { event: 'navigate' }, ({ payload }) => {
      if (payload && typeof payload.position === 'number') {
        setCurrentPosition((prev) => {
          setDirection(payload.position > prev ? 1 : -1);
          return payload.position;
        });
      }
    });

    channel.on('broadcast', { event: 'completed' }, ({ payload }) => {
      if (payload && typeof payload.index === 'number' && typeof payload.by === 'string') {
        setCompletedSet((prev) => new Set([...prev, payload.index]));
        setLastMarkedBy(payload.by);
      }
    });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ user_id: userId, name: displayName });
      }
    });

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [coupleId, userId, displayName]);

  const goTo = useCallback(
    (newPosition: number) => {
      if (newPosition < 0 || newPosition >= questions.length) return;
      setDirection(newPosition > currentPosition ? 1 : -1);
      setCurrentPosition(newPosition);

      channelRef.current?.send({
        type: 'broadcast',
        event: 'navigate',
        payload: { position: newPosition },
      });
    },
    [currentPosition, questions.length]
  );

  const goNext = () => goTo(currentPosition + 1);
  const goPrev = () => goTo(currentPosition - 1);

  const handleSetChange = (setNum: number) => {
    const firstInSet = questions.findIndex((q) => q.set === setNum);
    if (firstInSet !== -1) {
      goTo(firstInSet);
    }
  };

  const handleMarkCompleted = () => {
    if (!isMyTurn) return;

    const index = currentQuestion.index;

    // Optimistic: update UI immediately
    setCompletedSet((prev) => new Set([...prev, index]));
    setLastMarkedBy(userId);

    // Broadcast to partner immediately
    channelRef.current?.send({
      type: 'broadcast',
      event: 'completed',
      payload: { index, by: userId },
    });

    // Sync with DB in background (fire-and-forget)
    markQuestionCompleted(index).catch(() => {
      // Rollback on error
      setCompletedSet((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
      setLastMarkedBy(initialLastCompletedBy);
      toast.error('Erreur lors de l\u2019enregistrement');
    });
  };

  const setLabels: Record<number, string> = {
    1: 'S\u00e9rie I',
    2: 'S\u00e9rie II',
    3: 'S\u00e9rie III',
  };

  const setDescriptions: Record<number, string> = {
    1: 'De plus en plus personnel',
    2: 'Plus personnel',
    3: 'Le plus personnel',
  };

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  const completedCount = completedSet.size;

  // Whose turn label
  const turnName = isMyTurn ? displayName : (partnerName ?? 'Partenaire');

  // Waiting state
  if (!partnerPresent) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="rounded-[2rem] bg-white/5 backdrop-blur-[20px] border border-white/5 shadow-[inset_2px_2px_10px_rgba(255,173,249,0.1)] p-8 sm:p-12">
            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center -space-x-4">
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#ffadf9] to-[#ff77ff] text-lg font-bold text-[#37003a] border-4 border-[#180f24]">
                  {getInitials(displayName)}
                </div>
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-[#2f263c] text-lg font-bold text-[#d7c0d1] border-4 border-[#180f24]"
                >
                  {partnerName ? getInitials(partnerName) : '?'}
                </motion.div>
              </div>

              <div className="text-center">
                <motion.p
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-lg font-medium text-[#ecddfb]/80"
                >
                  {`En attente de ${partnerName ?? 'votre partenaire'}...`}
                </motion.p>
                {partnerLeft && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 text-sm text-[#d7c0d1]"
                  >
                    {'Votre partenaire s\u2019est d\u00e9connect\u00e9(e)'}
                  </motion.p>
                )}
              </div>

              <p className="text-sm text-[#d7c0d1]">
                {`${completedCount} sur 36 compl\u00e9t\u00e9es`}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Playing state
  return (
    <div className="space-y-6">
      {/* Online indicators */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center gap-3"
      >
        <div className="flex items-center gap-2">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#ffadf9] to-[#ff77ff] text-xs font-bold text-[#37003a]">
            {getInitials(displayName)}
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#ffadf9] shadow-[0_0_8px_#ffadf9] ring-2 ring-[#180f24]" />
          </div>
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#d4bbff] to-[#ffadf9] text-xs font-bold text-[#37003a]">
            {partnerName ? getInitials(partnerName) : '?'}
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#ffadf9] shadow-[0_0_8px_#ffadf9] ring-2 ring-[#180f24]" />
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ffadf9]/10 border border-[#ffadf9]/20 px-3 py-1 text-xs font-medium text-[#ffadf9]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#ffadf9] shadow-[0_0_6px_#ffadf9]" />
          {'Connect\u00e9s'}
        </span>
      </motion.div>

      {/* Progress + Turn indicator */}
      <div className="flex flex-col items-center gap-1">
        <p className="text-center text-xs text-[#d7c0d1]">
          {`${completedCount} sur 36 compl\u00e9t\u00e9es`}
        </p>
        <p className="text-center text-xs font-medium text-[#ffadf9]">
          {`C\u2019est au tour de ${turnName}`}
        </p>
      </div>

      {/* Set Tabs */}
      <div className="flex items-center justify-center gap-6">
        {[1, 2, 3].map((set) => (
          <button
            key={set}
            onClick={() => handleSetChange(set)}
            className={`font-['Inter'] text-xs uppercase tracking-widest pb-2 transition-colors ${
              activeSet === set
                ? 'text-[#ffadf9] border-b-2 border-[#ffadf9]'
                : 'text-[#d7c0d1] hover:text-[#ffadf9]'
            }`}
          >
            {setLabels[set]}
          </button>
        ))}
      </div>

      <p className="text-center text-xs text-[#d7c0d1]">
        {setDescriptions[activeSet]}
      </p>

      {/* Question Card */}
      <div className="relative min-h-[320px] overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentQuestion.index}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <div className="flex h-full flex-col rounded-[2rem] bg-white/5 backdrop-blur-[20px] border border-white/5 shadow-[inset_2px_2px_10px_rgba(255,173,249,0.1)]">
              <div className="flex flex-1 flex-col items-center justify-between gap-6 p-6 sm:p-8">
                {/* Top: Question number + set */}
                <div className="flex w-full items-center justify-between">
                  <span className="text-sm font-medium text-[#d7c0d1]">
                    {`Question ${currentQuestion.index} sur 36`}
                  </span>
                  <span className="inline-flex rounded-full bg-[#d4bbff]/10 border border-[#d4bbff]/20 px-3 py-1 text-xs font-medium text-[#d4bbff]">
                    {setLabels[currentQuestion.set]}
                  </span>
                </div>

                {/* Center: Question text */}
                <p className="text-center text-lg font-medium leading-relaxed text-[#ecddfb]/90 sm:text-xl">
                  {currentQuestion.text}
                </p>

                {/* Bottom: Status/Action */}
                <div className="flex w-full flex-col items-center gap-2">
                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ffadf9]/10 border border-[#ffadf9]/20 px-4 py-2 text-sm font-medium text-[#ffadf9]">
                      <Check className="h-3.5 w-3.5" />
                      {'Discut\u00e9'}
                    </span>
                  ) : isMyTurn ? (
                    <button
                      onClick={handleMarkCompleted}
                      className="rounded-full bg-gradient-to-tr from-[#ffadf9] to-[#ff77ff] px-6 py-3 text-sm font-bold text-[#37003a] transition-all active:scale-95 hover:shadow-[0_10px_30px_rgba(255,173,249,0.2)]"
                    >
                      {'Marquer comme discut\u00e9'}
                    </button>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d4bbff]/10 border border-[#d4bbff]/20 px-4 py-2 text-sm font-medium text-[#d4bbff]">
                        {`C\u2019est au tour de ${partnerName ?? 'votre partenaire'}`}
                      </span>
                      <span className="text-xs text-[#d7c0d1]/60">
                        {'Attendez que votre partenaire valide'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={goPrev}
          disabled={currentPosition === 0}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#524250]/20 text-[#ffadf9] transition-colors hover:bg-white/5 disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">{'Question pr\u00e9c\u00e9dente'}</span>
        </button>

        <span className="text-sm text-[#d7c0d1]">
          {currentPosition + 1} / {questions.length}
        </span>

        <button
          onClick={goNext}
          disabled={currentPosition === questions.length - 1}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#524250]/20 text-[#ffadf9] transition-colors hover:bg-white/5 disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Question suivante</span>
        </button>
      </div>
    </div>
  );
}
