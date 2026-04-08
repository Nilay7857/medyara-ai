import { AnimatePresence, motion } from 'framer-motion'
import { AudioLines, Mail, Lock, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { fetchProfile, signInWithEmail, signInWithGoogle, signUpWithEmail } from '../lib/auth'

type Props = {
  onAuthed: (user: User, profile: { username: string | null; email: string | null; id: string }) => void
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function prettyAuthError(message: string) {
  const m = message.toLowerCase()
  if (m.includes('invalid login') || m.includes('invalid_credentials')) return 'Wrong email or password'
  if (m.includes('email not confirmed')) return 'Please confirm your email before signing in'
  if (m.includes('password') && m.includes('should be')) return 'Password is too weak'
  if (m.includes('user already registered')) return 'Account already exists — sign in instead'
  return message
}

export default function AuthGate({ onAuthed }: Props) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>('')

  const canSubmit = useMemo(() => isValidEmail(email) && password.length > 0, [email, password])

  useEffect(() => {
    setError('')
  }, [mode])

  async function handleEmailAuth() {
    setError('')

    if (!email.trim()) return setError('Email is required')
    if (!isValidEmail(email.trim())) return setError('Invalid email')
    if (!password) return setError('Password required')

    setBusy(true)
    try {
      const normalizedEmail = email.trim().toLowerCase()
      const data =
        mode === 'signin'
          ? await signInWithEmail(normalizedEmail, password)
          : await signUpWithEmail(normalizedEmail, password)

      const user = data.user
      if (!user) {
        // For signUp, session can be null if email confirmation required.
        setError(mode === 'signup' ? 'Sign up succeeded. Check your email to confirm.' : 'Login failed')
        return
      }
      const profile = await fetchProfile(user)
      onAuthed(user, profile)
    } catch (e: any) {
      setError(prettyAuthError(e?.message || 'Login failed'))
    } finally {
      setBusy(false)
    }
  }

  async function handleGoogle() {
    setError('')
    setBusy(true)
    try {
      await signInWithGoogle()
      // Supabase OAuth will redirect; no further action here.
    } catch (e: any) {
      setError(prettyAuthError(e?.message || 'Login failed'))
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#05060a] text-white relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-90 bg-[radial-gradient(1200px_600px_at_20%_10%,rgba(59,130,246,0.35),transparent_60%),radial-gradient(900px_500px_at_70%_20%,rgba(168,85,247,0.26),transparent_60%),radial-gradient(800px_500px_at_55%_80%,rgba(34,211,238,0.18),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,6,10,0.25),rgba(5,6,10,0.95))]" />
        <motion.div
          aria-hidden
          className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full blur-3xl"
          style={{
            background:
              'conic-gradient(from 180deg at 50% 50%, rgba(34,211,238,0.22), rgba(59,130,246,0.22), rgba(168,85,247,0.22), rgba(34,211,238,0.22))',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 24, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
        />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="rounded-[32px] border border-white/12 bg-white/6 backdrop-blur-2xl shadow-[0_26px_110px_rgba(0,0,0,0.7)] overflow-hidden">
            <div className="p-7 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xl grid place-items-center">
                  <Sparkles className="h-6 w-6 text-white/90" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">Medyara AI</h1>
                  <p className="text-white/55 text-sm">Sign in to access your AI health assistant</p>
                </div>
              </div>
            </div>

            <div className="p-7">
              <button
                onClick={handleGoogle}
                disabled={busy}
                className="w-full inline-flex items-center justify-center gap-3 rounded-2xl border border-white/12 bg-white/10 hover:bg-white/14 transition px-4 py-3.5 font-semibold shadow-[0_18px_60px_rgba(0,0,0,0.35)] disabled:opacity-60"
              >
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
                  <path
                    fill="#FFC107"
                    d="M43.611 20.083H42V20H24v8h11.303C33.693 32.657 29.258 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917Z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.306 14.691 12.88 19.51C14.66 15.108 18.977 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691Z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24 44c5.166 0 9.86-1.977 13.409-5.197l-6.19-5.238C29.135 35.091 26.715 36 24 36c-5.236 0-9.657-3.328-11.283-7.946l-6.525 5.025C9.505 39.556 16.227 44 24 44Z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.611 20.083H42V20H24v8h11.303a12.05 12.05 0 0 1-4.087 5.565l.003-.002 6.19 5.238C36.971 40.205 44 35 44 24c0-1.341-.138-2.651-.389-3.917Z"
                  />
                </svg>
                Continue with Google
              </button>

              <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs text-white/40">or</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 flex items-center gap-3">
                  <Mail className="h-4 w-4 text-white/55" />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="Email"
                    className="w-full bg-transparent outline-none text-sm placeholder:text-white/35"
                  />
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 flex items-center gap-3">
                  <Lock className="h-4 w-4 text-white/55" />
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    placeholder="Password"
                    className="w-full bg-transparent outline-none text-sm placeholder:text-white/35"
                  />
                </div>

                <button
                  onClick={handleEmailAuth}
                  disabled={busy || !canSubmit}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/10 hover:bg-white/14 transition px-4 py-3.5 font-semibold disabled:opacity-60"
                >
                  <AudioLines className="h-4 w-4" />
                  {mode === 'signin' ? 'Sign In' : 'Sign Up'}
                </button>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    className="text-xs text-white/50 hover:text-white transition"
                    onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                  >
                    {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                  </button>
                  <span className="text-[11px] text-white/30">Secure via Supabase</span>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-xs text-red-100"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <p className="mt-6 text-[11px] leading-relaxed text-white/35">
                By continuing, you agree to use Medyara AI responsibly. It may be inaccurate and is not a substitute for
                professional medical advice.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
