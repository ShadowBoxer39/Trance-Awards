import { User } from '@supabase/supabase-js';

export interface GoogleUserInfo {
  name: string;
  photoUrl: string | null;
  email: string | null;
}

/**
 * Extract user information from Google OAuth user object
 */
export function getGoogleUserInfo(user: User | null): GoogleUserInfo | null {
  if (!user) return null;

  // Google OAuth stores user metadata in user_metadata
  const metadata = user.user_metadata;

  const name = metadata?.full_name || metadata?.name || user.email?.split('@')[0] || 'משתמש';
  const photoUrl = metadata?.avatar_url || metadata?.picture || null;
  const email = user.email || null;

  return {
    name,
    photoUrl,
    email,
  };
}
