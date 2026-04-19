'use client';

import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState } from 'react';
import type { MessageRow } from '@/lib/conversations/types';

interface MessageBubbleProps {
  message: MessageRow;
  isOwn: boolean;
  isGroupStart: boolean;
  isGroupEnd: boolean;
  readByOther: boolean;
  status?: 'sending' | 'sent' | 'failed';
}

export function MessageBubble({
  message,
  isOwn,
  isGroupStart,
  isGroupEnd,
  readByOther,
  status,
}: MessageBubbleProps) {
  const [showTime, setShowTime] = useState(false);

  const ownCorners = cn(
    'rounded-[1.25rem]',
    isGroupStart && isGroupEnd && 'rounded-[1.25rem]',
    isGroupStart && !isGroupEnd && 'rounded-br-md',
    !isGroupStart && isGroupEnd && 'rounded-tr-md',
    !isGroupStart && !isGroupEnd && 'rounded-tr-md rounded-br-md'
  );

  const otherCorners = cn(
    'rounded-[1.25rem]',
    isGroupStart && !isGroupEnd && 'rounded-bl-md',
    !isGroupStart && isGroupEnd && 'rounded-tl-md',
    !isGroupStart && !isGroupEnd && 'rounded-tl-md rounded-bl-md'
  );

  return (
    <div
      className={cn(
        'flex w-full',
        isOwn ? 'justify-end' : 'justify-start',
        isGroupEnd ? 'mb-2' : 'mb-0.5'
      )}
    >
      <div className={cn('flex flex-col gap-1 max-w-[78%]', isOwn ? 'items-end' : 'items-start')}>
        <button
          type="button"
          onClick={() => setShowTime((v) => !v)}
          className={cn(
            'text-left px-3.5 py-2 text-[0.92rem] leading-snug transition-colors',
            isOwn
              ? cn(
                  'bg-[linear-gradient(180deg,#a7bfff,#7ea0ff)] text-[#09111f]',
                  ownCorners
                )
              : cn('bg-white/[0.06] text-foreground border border-white/10', otherCorners),
            status === 'sending' && 'opacity-70',
            status === 'failed' && 'border-red-400/40 text-red-100'
          )}
        >
          {message.body}
        </button>
        {isGroupEnd && (
          <div className="flex items-center gap-1.5 text-[0.65rem] text-muted-foreground">
            {showTime && (
              <span>
                {formatDistanceToNow(new Date(message.created_at), {
                  locale: fr,
                  addSuffix: true,
                })}
              </span>
            )}
            {isOwn && status !== 'failed' && (
              <span
                className={cn(
                  'text-[0.65rem]',
                  readByOther ? 'text-[#dbe7ff]' : 'text-muted-foreground'
                )}
              >
                {status === 'sending' ? '· envoi…' : readByOther ? '· Lu' : '· Envoyé'}
              </span>
            )}
            {status === 'failed' && <span className="text-red-300">· Échec</span>}
          </div>
        )}
      </div>
    </div>
  );
}
