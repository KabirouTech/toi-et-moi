'use client';

import { deleteEvent } from '@/app/calendar/actions';
import { formatEventDate } from '@/lib/helpers';
import { Trash2, Heart, Star, Gift, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';

type Event = {
  id: string;
  title: string;
  date: string;
  type: 'date' | 'anniversary' | 'birthday' | 'other';
};

const typeConfig: Record<
  Event['type'],
  { dotColor: string; glowColor: string; icon: typeof Heart }
> = {
  date: {
    dotColor: 'bg-[#ffadf9]',
    glowColor: 'shadow-[0_0_8px_#ffadf9]',
    icon: Heart,
  },
  anniversary: {
    dotColor: 'bg-[#d4bbff]',
    glowColor: 'shadow-[0_0_8px_#d4bbff]',
    icon: Star,
  },
  birthday: {
    dotColor: 'bg-[#FFBF00]',
    glowColor: 'shadow-[0_0_8px_#FFBF00]',
    icon: Gift,
  },
  other: {
    dotColor: 'bg-[#00A3FF]',
    glowColor: 'shadow-[0_0_8px_#00A3FF]',
    icon: CalendarDays,
  },
};

function groupByMonth(events: Event[]): Record<string, Event[]> {
  const groups: Record<string, Event[]> = {};
  for (const event of events) {
    const key = format(new Date(event.date), 'MMMM yyyy');
    if (!groups[key]) groups[key] = [];
    groups[key].push(event);
  }
  return groups;
}

export function EventList({ events }: { events: Event[] }) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <CalendarDays className="h-12 w-12 text-[#d7c0d1]/40" />
        <p className="mt-4 text-sm text-[#d7c0d1]">
          Aucun événement. Ajoutez votre première date spéciale !
        </p>
      </div>
    );
  }

  const grouped = groupByMonth(events);

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([month, monthEvents]) => (
        <div key={month}>
          <h2 className="mb-4 font-['Inter'] text-xs uppercase tracking-widest text-[#d7c0d1]">
            {month}
          </h2>
          <div className="space-y-3">
            {monthEvents.map((event) => {
              const config = typeConfig[event.type];
              const Icon = config.icon;
              return (
                <div
                  key={event.id}
                  className="flex items-center gap-4 rounded-[2rem] bg-white/5 backdrop-blur-[12px] border border-white/[0.08] px-5 py-4 transition-all duration-200 hover:bg-white/[0.08]"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${config.dotColor} ${config.glowColor}`}
                    />
                    <Icon className="h-4 w-4 text-[#d7c0d1]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#ecddfb]">
                      {event.title}
                    </p>
                    <p className="text-xs text-[#d7c0d1]">
                      {formatEventDate(event.date)}
                    </p>
                  </div>
                  <form action={deleteEvent}>
                    <input type="hidden" name="eventId" value={event.id} />
                    <button
                      type="submit"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-[#d7c0d1]/60 transition-colors hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="sr-only">Supprimer</span>
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
