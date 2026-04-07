import { type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getValidToken, listUserPhotos } from '@/lib/google-photos';

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

    const pageToken =
      request.nextUrl.searchParams.get('pageToken') || undefined;

    const result = await listUserPhotos(accessToken, 30, pageToken);

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
    console.error('User photos API error:', err);
    return Response.json(
      { error: err.message || 'Erreur interne' },
      { status: 500 }
    );
  }
}
