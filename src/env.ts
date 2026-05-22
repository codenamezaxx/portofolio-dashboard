/**
 * Environment Variable Validation with Zod
 *
 * This file validates all required environment variables at build/startup time.
 * Add new env vars here and they will be validated before the app starts.
 *
 * Usage:
 *   import { env } from '@/env'
 *   console.log(env.NEXT_PUBLIC_SUPABASE_URL)
 */

import { z } from 'zod';

// ============================================================
// Server-side environment variables (never exposed to client)
// ============================================================
const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Supabase (server-side service role key — keep secret)
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // JWT secret for session tokens
  JWT_SECRET: z.string().min(32),

  // Admin credentials (used for initial setup)
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),
});

// ============================================================
// Client-side environment variables (NEXT_PUBLIC_ prefix)
// ============================================================
const clientSchema = z.object({
  // Supabase public config
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),

  // Site URL
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),

  // Google Analytics
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().min(1).optional(),
});

// ============================================================
// Merge and validate
// ============================================================
const envSchema = serverSchema.merge(clientSchema);

type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const isServer = typeof window === 'undefined';

  if (!isServer) {
    // On client side, we must explicitly access NEXT_PUBLIC_ variables
    // because process.env is not a real object in the browser
    const clientValues = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    };

    const parsedClient = clientSchema.safeParse(clientValues);
    if (!parsedClient.success) {
      console.error('❌ Invalid client environment variables:');
      console.error(parsedClient.error.flatten().fieldErrors);
      throw new Error('Invalid client environment variables. Check the console for details.');
    }
    return parsedClient.data as Env;
  }

  // On server side, validate everything
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables. Check the console for details.');
  }

  return parsed.data;
}

// Export validated env — throws at startup if required vars are missing
export const env = validateEnv();
