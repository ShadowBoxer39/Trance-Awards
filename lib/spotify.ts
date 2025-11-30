// lib/spotify.ts - Spotify Web API Helper (FIXED ENDPOINTS)

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

let accessToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * Get Spotify access token using Client Credentials flow
 */
async function getAccessToken(): Promise<string> {
  // Return cached token if still valid
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }
  
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
      console.error("FATAL: SPOTIFY_CLIENT_ID or SECRET missing from environment.");
      throw new Error('Spotify credentials not configured.');
  }

  // FIXED: Using the official Spotify token endpoint
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      // Base64 encode the Client ID and Secret
      Authorization: `Basic ${Buffer.from(
        `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
      ).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to get Spotify access token:', response.status, errorText);
    throw new Error('Failed to get Spotify access token');
  }

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000 - 60000; // Refresh 1 min early

  return accessToken;
}

/**
 * Get artist profile from Spotify
 */
export async function getArtistProfile(artistId: string) {
  try {
    const token = await getAccessToken();

    // FIXED: Using the official Spotify API base URL
    const response = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Spotify API error (Profile):', response.status);
      return null;
    }

    const data = await response.json();

    return {
      name: data.name,
      followers: data.followers?.total || 0,
      genres: data.genres,
      popularity: data.popularity,
      image: data.images[0]?.url,
      spotifyUrl: data.external_urls?.spotify,
    };
  } catch (error) {
    console.error('Error fetching artist profile:', error);
    return null;
  }
}

/**
 * Get artist's top tracks from Spotify
 */
export async function getArtistTopTracks(artistId: string, market: string = 'IL') {
  try {
    const token = await getAccessToken();

    // FIXED: Using the official Spotify API base URL
    const response = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=${market}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Spotify API error (Top Tracks):', response.status);
      return null;
    }

    const data = await response.json();

    return (data.tracks || []).slice(0, 5).map((track: any) => ({
      id: track.id,
      name: track.name,
      album: {
          name: track.album.name,
          images: track.album.images,
          release_date: track.album.release_date,
      },
      albumCover: track.album.images[0]?.url,
      duration: track.duration_ms,
      previewUrl: track.preview_url,
      spotifyUrl: track.external_urls.spotify,
      external_urls: track.external_urls, // Ensure external_urls is present for TS compatibility
    }));
  } catch (error) {
    console.error('Error fetching top tracks:', error);
    return null;
  }
}

/**
 * Get artist's full discography (albums + singles)
 */
export async function getArtistDiscography(artistId: string) {
  try {
    const token = await getAccessToken();

    // FIXED: Using the official Spotify API base URL
    const response = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single&market=IL&limit=50`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Spotify API error (Discography):', response.status);
      return null;
    }

    const data = await response.json();

    return data.items.map((album: any) => ({
      id: album.id,
      name: album.name,
      releaseDate: album.release_date,
      type: album.album_type,
      coverImage: album.images[0]?.url,
      spotifyUrl: album.external_urls.spotify,
      totalTracks: album.total_tracks,
    }));
  } catch (error) {
    console.error('Error fetching discography:', error);
    return null;
  }
}

// NOTE: getArtistLatestRelease is no longer needed since getArtistDiscography covers this.
