import { type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { exchangeCodeForTokens, createSharedAlbum } from '@/lib/google-photos';
import { redirect } from 'next/navigation';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    redirect('/album?error=access_denied');
  }

  if (!code || !state) {
    redirect('/album?error=missing_params');
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Verify state matches the user
  try {
    const stateData = JSON.parse(
      Buffer.from(state, 'base64url').toString('utf-8')
    );
    if (stateData.userId !== user.id) {
      redirect('/album?error=state_mismatch');
    }
  } catch {
    redirect('/album?error=invalid_state');
  }

  try {
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);
    const expiresAt = new Date(
      Date.now() + tokens.expires_in * 1000
    ).toISOString();

    // Upsert tokens
    const { error: upsertError } = await supabase
      .from('google_photos_tokens')
      .upsert(
        {
          user_id: user.id,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (upsertError) {
      console.error('Token upsert error:', upsertError);
      redirect('/album?error=token_save');
    }

    // Check if couple already has a shared album
    const { data: coupleMember } = await supabase
      .from('couple_members')
      .select('couple_id')
      .eq('user_id', user.id)
      .single();

    if (coupleMember) {
      const { data: couple } = await supabase
        .from('couples')
        .select('id, name, google_album_id')
        .eq('id', coupleMember.couple_id)
        .single();

      if (couple && !couple.google_album_id) {
        // Create shared album
        const albumTitle = `Toi et Moi — ${couple.name || 'Notre album'}`;
        const album = await createSharedAlbum(
          tokens.access_token,
          albumTitle
        );

        await supabase
          .from('couples')
          .update({
            google_album_id: album.id,
            google_album_url: album.productUrl,
          })
          .eq('id', couple.id);
      }
    }
  } catch (err) {
    console.error('Google Photos callback error:', err);
    redirect('/album?error=exchange_failed');
  }

  redirect('/album');
}
