import { createClient } from '@/lib/supabase/server';
import { getAuthUrl } from '@/lib/google-photos';
import { redirect } from 'next/navigation';

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Non authentifié' }, { status: 401 });
  }

  // Encode user ID as state for verification in callback
  const state = Buffer.from(
    JSON.stringify({ userId: user.id, ts: Date.now() })
  ).toString('base64url');

  const authUrl = getAuthUrl(state);
  redirect(authUrl);
}
