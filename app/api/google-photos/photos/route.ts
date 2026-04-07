import { type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getValidToken, listAlbumPhotos } from '@/lib/google-photos';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Non authentifié' }, { status: 401 });
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
      return Response.json({ photos: [], nextPageToken: null });
    }

    const pageToken =
      request.nextUrl.searchParams.get('pageToken') || undefined;

    const result = await listAlbumPhotos(
      accessToken,
      couple.google_album_id,
      pageToken
    );

    const photos = result.mediaItems.map((item: any) => ({
      id: item.id,
      baseUrl: item.baseUrl,
      width: Number(item.mediaMetadata?.width || 0),
      height: Number(item.mediaMetadata?.height || 0),
      description: item.description || null,
      creationTime: item.mediaMetadata?.creationTime || null,
    }));

    return Response.json({
      photos,
      nextPageToken: result.nextPageToken || null,
    });
  } catch (err: any) {
    console.error('Photos API error:', err);
    return Response.json(
      { error: err.message || 'Erreur interne' },
      { status: 500 }
    );
  }
}
