const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/google-photos/callback`;

const SCOPES = [
  'https://www.googleapis.com/auth/photoslibrary.readonly',
  'https://www.googleapis.com/auth/photoslibrary.appendonly',
  'https://www.googleapis.com/auth/photoslibrary.sharing',
];

const PHOTOS_API_BASE = 'https://photoslibrary.googleapis.com/v1';

export function getAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForTokens(
  code: string
): Promise<{ access_token: string; refresh_token: string; expires_in: number }> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token exchange failed: ${err}`);
  }

  return res.json();
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<{ access_token: string; expires_in: number }> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token refresh failed: ${err}`);
  }

  return res.json();
}

export async function getValidToken(
  supabase: any,
  userId: string
): Promise<string> {
  const { data: tokenRow, error } = await supabase
    .from('google_photos_tokens')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !tokenRow) {
    throw new Error('Google Photos non connecté');
  }

  const now = new Date();
  const expiresAt = new Date(tokenRow.expires_at);

  // Refresh if expiring within 5 minutes
  if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
    const refreshed = await refreshAccessToken(tokenRow.refresh_token);
    const newExpiresAt = new Date(
      Date.now() + refreshed.expires_in * 1000
    ).toISOString();

    await supabase
      .from('google_photos_tokens')
      .update({
        access_token: refreshed.access_token,
        expires_at: newExpiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    return refreshed.access_token;
  }

  return tokenRow.access_token;
}

export async function listAlbumPhotos(
  accessToken: string,
  albumId: string,
  pageToken?: string
): Promise<{ mediaItems: any[]; nextPageToken?: string }> {
  const body: any = { albumId, pageSize: 50 };
  if (pageToken) body.pageToken = pageToken;

  const res = await fetch(`${PHOTOS_API_BASE}/mediaItems:search`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to list album photos: ${err}`);
  }

  const data = await res.json();
  return {
    mediaItems: data.mediaItems || [],
    nextPageToken: data.nextPageToken,
  };
}

export async function createSharedAlbum(
  accessToken: string,
  title: string
): Promise<{ id: string; productUrl: string; shareInfo: any }> {
  // Create album
  const createRes = await fetch(`${PHOTOS_API_BASE}/albums`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ album: { title } }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Failed to create album: ${err}`);
  }

  const album = await createRes.json();

  // Share album
  const shareRes = await fetch(
    `${PHOTOS_API_BASE}/albums/${album.id}:share`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sharedAlbumOptions: {
          isCollaborative: true,
          isCommentable: true,
        },
      }),
    }
  );

  if (!shareRes.ok) {
    const err = await shareRes.text();
    throw new Error(`Failed to share album: ${err}`);
  }

  const shareData = await shareRes.json();

  return {
    id: album.id,
    productUrl: album.productUrl,
    shareInfo: shareData.shareInfo,
  };
}

export async function addPhotosToAlbum(
  accessToken: string,
  albumId: string,
  mediaItemIds: string[]
): Promise<void> {
  const res = await fetch(
    `${PHOTOS_API_BASE}/albums/${albumId}:batchAddMediaItems`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mediaItemIds }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to add photos to album: ${err}`);
  }
}

export async function listUserPhotos(
  accessToken: string,
  pageSize: number = 30,
  pageToken?: string
): Promise<{ mediaItems: any[]; nextPageToken?: string }> {
  const params = new URLSearchParams({ pageSize: String(pageSize) });
  if (pageToken) params.set('pageToken', pageToken);

  const res = await fetch(`${PHOTOS_API_BASE}/mediaItems?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to list user photos: ${err}`);
  }

  const data = await res.json();
  return {
    mediaItems: data.mediaItems || [],
    nextPageToken: data.nextPageToken,
  };
}

export async function searchUserPhotos(
  accessToken: string,
  filters?: any,
  pageToken?: string
): Promise<{ mediaItems: any[]; nextPageToken?: string }> {
  const body: any = { pageSize: 50 };
  if (filters) body.filters = filters;
  if (pageToken) body.pageToken = pageToken;

  const res = await fetch(`${PHOTOS_API_BASE}/mediaItems:search`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to search photos: ${err}`);
  }

  const data = await res.json();
  return {
    mediaItems: data.mediaItems || [],
    nextPageToken: data.nextPageToken,
  };
}
