import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// IMPORTANT: In Vite preview/deploys, env vars may be missing.
// Calling createClient('', '') can cause runtime issues later. Instead, we create a safe no-op-ish client.

const hasConfig = Boolean(supabaseUrl && supabaseAnonKey)

if (!hasConfig) {
  // eslint-disable-next-line no-console
  console.warn('[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Auth will be disabled.')
}

export const supabase = hasConfig
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : createClient('https://invalid.supabase.co', 'invalid-anon-key')

export const supabaseConfigured = hasConfig
