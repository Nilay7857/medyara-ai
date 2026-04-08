import type { User } from '@supabase/supabase-js'
import { supabase } from './supabase'

export type Profile = {
  id: string
  email: string | null
  username: string | null
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  })
  if (error) throw error
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function fetchProfile(user: User): Promise<Profile> {
  // Assumption: a `profiles` table exists with columns: id (uuid), email (text), username (text)
  // id == auth.users.id
  const { data, error } = await supabase
    .from('profiles')
    .select('id,email,username')
    .eq('id', user.id)
    .maybeSingle()

  if (error) throw error

  if (data) {
    return {
      id: data.id,
      email: (data as any).email ?? user.email ?? null,
      username: (data as any).username ?? null,
    }
  }

  // Create profile if missing
  const { data: created, error: insertError } = await supabase
    .from('profiles')
    .insert({ id: user.id, email: user.email ?? null, username: null })
    .select('id,email,username')
    .single()

  if (insertError) throw insertError

  return {
    id: created.id,
    email: (created as any).email ?? user.email ?? null,
    username: (created as any).username ?? null,
  }
}

export async function setUsername(userId: string, username: string) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ username })
    .eq('id', userId)
    .select('id,email,username')
    .single()

  if (error) throw error
  return data
}
