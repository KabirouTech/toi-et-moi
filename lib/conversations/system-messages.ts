import type { SupabaseClient } from '@supabase/supabase-js';
import type { MessageMetadata } from './types';

export async function insertSystemMessage(
  supabase: SupabaseClient,
  params: {
    coupleId: string;
    contextType: 'memory' | 'thread' | 'main';
    contextId: string | null;
    event: string;
    metadata?: Record<string, unknown>;
    authorId?: string | null;
  }
) {
  const { data, error } = await supabase.rpc('create_system_message', {
    p_couple_id: params.coupleId,
    p_context_type: params.contextType,
    p_context_id: params.contextId,
    p_event: params.event,
    p_metadata: params.metadata ?? {},
    p_author_id: params.authorId ?? null,
  });

  if (error) throw error;
  return data as string;
}

export function narrowMetadata<K extends MessageMetadata['event']>(
  metadata: Record<string, unknown>,
  event: K
): Extract<MessageMetadata, { event: K }> | null {
  if (metadata?.event === event) {
    return metadata as Extract<MessageMetadata, { event: K }>;
  }
  return null;
}
