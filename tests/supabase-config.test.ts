import { test } from 'node:test'
import assert from 'node:assert/strict'
import { publicSupabaseConfig } from '../config/supabase'

test('Vercel integration aliases configure Supabase using public values only', () => {
  assert.deepEqual(publicSupabaseConfig({
    SUPABASE_URL: 'https://example.supabase.co',
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'public-key',
    SUPABASE_SECRET_KEY: 'private-secret',
    SUPABASE_SERVICE_ROLE_KEY: 'private-role',
    SUPABASE_JWT_SECRET: 'private-jwt',
    POSTGRES_PASSWORD: 'private-password',
  }), { supabaseUrl: 'https://example.supabase.co', supabasePublishableKey: 'public-key' })
  assert.deepEqual(publicSupabaseConfig({ SUPABASE_SECRET_KEY: 'secret', SUPABASE_SERVICE_ROLE_KEY: 'role' }), { supabaseUrl: '', supabasePublishableKey: '' })
})

test('Nuxt variables take precedence and legacy anon keys remain supported', () => {
  assert.deepEqual(publicSupabaseConfig({ NUXT_PUBLIC_SUPABASE_URL: 'nuxt-url', SUPABASE_URL: 'alias-url', NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'nuxt-key', NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'alias-key' }), { supabaseUrl: 'nuxt-url', supabasePublishableKey: 'nuxt-key' })
  assert.equal(publicSupabaseConfig({ SUPABASE_ANON_KEY: 'legacy-public' }).supabasePublishableKey, 'legacy-public')
  assert.deepEqual(publicSupabaseConfig({}), { supabaseUrl: '', supabasePublishableKey: '' })
})
