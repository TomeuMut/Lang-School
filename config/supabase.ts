// Only public configuration may cross the server/client boundary.
export function publicSupabaseConfig(env: Record<string, string | undefined>) {
  return {
    supabaseUrl: env.NUXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL || '',
    supabasePublishableKey: env.NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      || env.SUPABASE_PUBLISHABLE_KEY
      || env.SUPABASE_ANON_KEY || '',
  }
}
