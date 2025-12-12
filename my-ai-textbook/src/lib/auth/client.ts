/**
 * BetterAuth Client - Frontend authentication utilities
 */

import { createAuthClient } from 'better-auth/client';

export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : '',
});

/**
 * Sign up a new user
 */
export async function signUp(email: string, password: string, name?: string) {
  try {
    const result = await authClient.signUp.email({
      email,
      password,
      name: name || email.split('@')[0],
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.data;
  } catch (error) {
    console.error('[Auth Client] Sign up error:', error);
    throw error;
  }
}

/**
 * Sign in an existing user
 */
export async function signIn(email: string, password: string) {
  try {
    const result = await authClient.signIn.email({
      email,
      password,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.data;
  } catch (error) {
    console.error('[Auth Client] Sign in error:', error);
    throw error;
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  try {
    await authClient.signOut();
  } catch (error) {
    console.error('[Auth Client] Sign out error:', error);
    throw error;
  }
}

/**
 * Get the current session
 */
export async function getSession() {
  try {
    const session = await authClient.getSession();
    return session;
  } catch (error) {
    console.error('[Auth Client] Get session error:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session?.user;
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user || null;
}

/**
 * Update user profile
 */
export async function updateProfile(data: {
  name?: string;
  email?: string;
}) {
  try {
    const result = await authClient.updateUser(data);

    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.data;
  } catch (error) {
    console.error('[Auth Client] Update profile error:', error);
    throw error;
  }
}

/**
 * Change password
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string
) {
  try {
    const result = await authClient.changePassword({
      currentPassword,
      newPassword,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.data;
  } catch (error) {
    console.error('[Auth Client] Change password error:', error);
    throw error;
  }
}
