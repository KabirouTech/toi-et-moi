import { createClient } from '@/lib/supabase/server';
import { getValidToken, addPhotosToAlbum } from '@/lib/google-photos';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { mediaItemIds } = body;

    if (!Array.isArray(mediaItemIds) || mediaItemIds.length === 0) {
      return Response.json(
        { error: 'mediaItemIds requis' },
        { status: 400 }
      );
    }

    const accessToken = await getValidToken(supabase, user.id);

    // Get couple's album ID
    const { data: coupleMember } = await supabase
      .from('couple_members')
      .select('couple_id')
      .eq('user_id', user.id)
      .single();

    if (!coupleMember) {
      return Response.json({ error: 'Couple non trouvé' }, { status: 404 });
    }

    const { data: couple } = await supabase
      .from('couples')
      .select('google_album_id')
      .eq('id', coupleMember.couple_id)
      .single();

    if (!couple?.google_album_id) {
      return Response.json(
        { error: 'Album non créé' },
        { status: 404 }
      );
    }

    await addPhotosToAlbum(accessToken, couple.google_album_id, mediaItemIds);

    return Response.json({ success: true });
  } catch (err: any) {
    console.error('Add to album error:', err);
    return Response.json(
      { error: err.message || 'Erreur interne' },
      { status: 500 }
    );
  }
}
