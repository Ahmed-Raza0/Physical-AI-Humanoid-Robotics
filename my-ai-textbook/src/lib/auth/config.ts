/**
 * BetterAuth Configuration
 * Authentication setup with email/password and session management
 */

import { betterAuth } from 'better-auth';
import { env } from '../utils/env';

export const auth = betterAuth({
  database: {
    // For now, use in-memory storage (suitable for development)
    // In production, use a real database (Postgres, MySQL, etc.)
    provider: 'sqlite',
    url: './auth.db',
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },

  advanced: {
    crossSubDomainCookies: {
      enabled: false,
    },
    useSecureCookies: env.IS_PRODUCTION,
    generateId: () => {
      // Use nanoid for generating IDs
      const { nanoid } = require('nanoid');
      return nanoid();
    },
  },

  socialProviders: {
    // Can add GitHub, Google, etc. later
    // github: {
    //   clientId: env.GITHUB_CLIENT_ID,
    //   clientSecret: env.GITHUB_CLIENT_SECRET,
    // },
  },

  // Callbacks
  callbacks: {
    async signIn({ user, account }) {
      console.log(`[Auth] User signed in: ${user.email}`);
      return true;
    },

    async signOut({ session }) {
      console.log('[Auth] User signed out');
      return true;
    },
  },

  // Rate limiting
  rateLimit: {
    enabled: true,
    window: 60, // 1 minute
    max: 10, // 10 requests per minute
  },
});

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
