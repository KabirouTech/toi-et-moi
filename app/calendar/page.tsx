import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AddEventDialog } from '@/components/custom/add-event-dialog';
import { EventList } from '@/components/custom/event-list';
import { BottomNav } from '@/components/custom/bottom-nav';

export default async function CalendarPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: coupleMember } = await supabase
    .from('couple_members')
    .select('couple_id')
    .eq('user_id', user.id)
    .single();

  if (!coupleMember) {
    redirect('/setup');
  }

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('couple_id', coupleMember.couple_id)
    .order('date', { ascending: true });

  return (
    <div className="min-h-screen bg-[#180f24]">
      <div className="mx-auto max-w-2xl px-4 py-8 pb-32 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold italic tracking-tight text-[#ecddfb] sm:text-4xl">
              Calendrier
            </h1>
            <p className="mt-1 text-sm text-[#d7c0d1]">
              Vos dates importantes
            </p>
          </div>
          <AddEventDialog />
        </div>

        {/* Event List */}
        <div className="mt-8">
          <EventList events={events ?? []} />
        </div>
      </div>

      <BottomNav active="calendar" />
    </div>
  );
}
