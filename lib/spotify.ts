// lib/spotify.ts - Spotify Web API Helper

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

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(
        `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
      ).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error('Failed to get Spotify access token');
  }

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000 - 60000; // Refresh 1 min early

  return accessToken;
}

/**
 * Get artist's latest release from Spotify
 */
export async function getArtistLatestRelease(artistId: string) {
  try {
    const token = await getAccessToken();

    // Get artist's albums/singles sorted by release date
    const response = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single&market=IL&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Spotify API error:', response.status);
      return null;
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return null;
    }

    const latestRelease = data.items[0];

    return {
      name: latestRelease.name,
      releaseDate: latestRelease.release_date,
      type: latestRelease.album_type, // 'album' or 'single'
      spotifyUrl: latestRelease.external_urls.spotify,
      embedUrl: `https://open.spotify.com/embed/album/${latestRelease.id}`,
      coverImage: latestRelease.images[0]?.url,
    };
  } catch (error) {
    console.error('Error fetching Spotify data:', error);
    return null;
  }
}

/**
 * Get artist profile from Spotify
 */
export async function getArtistProfile(artistId: string) {
  try {
    const token = await getAccessToken();

    const response = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Spotify API error:', response.status);
      return null;
    }

    const data = await response.json();

    return {
      name: data.name,
      followers: data.followers.total,
      genres: data.genres,
      popularity: data.popularity,
      image: data.images[0]?.url,
      spotifyUrl: data.external_urls.spotify,
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

    const response = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=${market}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Spotify API error:', response.status);
      return null;
    }

    const data = await response.json();

    return data.tracks.slice(0, 5).map((track: any) => ({
      id: track.id,
      name: track.name,
      album: track.album.name,
      albumCover: track.album.images[0]?.url,
      duration: track.duration_ms,
      previewUrl: track.preview_url,
      spotifyUrl: track.external_urls.spotify,
      embedUrl: `https://open.spotify.com/embed/track/${track.id}`,
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

    const response = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single&market=IL&limit=50`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Spotify API error:', response.status);
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
