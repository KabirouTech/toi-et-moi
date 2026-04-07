import { differenceInDays, format, isToday, isTomorrow } from 'date-fns';

export function daysTogether(anniversaryDate: string | Date): number {
  const start = new Date(anniversaryDate);
  const now = new Date();
  return differenceInDays(now, start);
}

export function formatEventDate(date: string | Date): string {
  const d = new Date(date);
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  return format(d, 'MMM d, yyyy');
}

export function formatRelativeDate(date: string | Date): string {
  const d = new Date(date);
  return format(d, 'MMMM d, yyyy');
}

export function getInviteUrl(inviteCode: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/invite/${inviteCode}`;
}
