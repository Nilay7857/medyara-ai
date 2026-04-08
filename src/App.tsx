import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  AudioLines,
  FileText,
  GraduationCap,
  Image as ImageIcon,
  LogOut,
  Paperclip,
  Sparkles,
  Stethoscope,
  TriangleAlert,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import AuthGate from './components/AuthGate'
import AdBanner from './components/AdBanner'
import UsernameModal from './components/UsernameModal'
import { fetchProfile, setUsername as persistUsername, signOut } from './lib/auth'
import { supabase, supabaseConfigured } from './lib/supabase'

type OutputKey = 'causes' | 'actions' | 'warnings' | 'doctor'

type Tool = 'symptoms' | 'report' | 'study' | 'image'

type Stage = {
  label: string
  hint: string
}

const STAGES: Stage[] = [
  { label: 'Analyzing symptoms…', hint: 'Parsing signals & timelines' },
  { label: 'Checking possible causes…', hint: 'Cross-referencing patterns' },
  { label: 'Generating advice…', hint: 'Prioritizing safety first' },
]

const OUTPUT_ORDER: { key: OutputKey; title: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'causes', title: 'Possible Causes', icon: Sparkles },
  { key: 'actions', title: 'What You Can Do', icon: Stethoscope },
  { key: 'warnings', title: 'Warning Signs', icon: TriangleAlert },
  { key: 'doctor', title: 'When to See Doctor', icon: Activity },
]

function splitIntoBullets(text: string) {
  return text
    .split(/\n|•|-\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 10)
}

function extractSection(source: string, heading: string) {
  const rx = new RegExp(`(^|\\n)\\s*${heading}\\s*[:\-]\\s*`, 'i')
  const idx = source.search(rx)
  if (idx === -1) return ''
  const after = source.slice(idx).replace(rx, '')

  // Stop at next heading-like line
  const stop = after.search(/\n\s*(Possible Causes|What You Can Do|Warning Signs|When to See Doctor)\s*[:\-]/i)
  return (stop === -1 ? after : after.slice(0, stop)).trim()
}

function parseOutput(text: string): Record<OutputKey, string[]> {
  const causes = extractSection(text, 'Possible Causes')
  const actions = extractSection(text, 'What You Can Do')
  const warnings = extractSection(text, 'Warning Signs')
  const doctor = extractSection(text, 'When to See Doctor')

  // Fallback: if headings missing, chunk by paragraphs
  if (!causes && !actions && !warnings && !doctor) {
    const paras = text
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter(Boolean)
    return {
      causes: splitIntoBullets(paras[0] ?? text),
      actions: splitIntoBullets(paras[1] ?? ''),
      warnings: splitIntoBullets(paras[2] ?? ''),
      doctor: splitIntoBullets(paras[3] ?? ''),
    }
  }

  return {
    causes: splitIntoBullets(causes),
    actions: splitIntoBullets(actions),
    warnings: splitIntoBullets(warnings),
    doctor: splitIntoBullets(doctor),
  }
}

function useSpeechToText(onResult: (text: string) => void) {
  const recRef = useRef<any>(null)
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    setSupported(true)
    const rec = new SR()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'en-US'
    rec.onresult = (e: any) => {
      let finalText = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]
        if (r.isFinal) finalText += r[0].transcript
      }
      if (finalText.trim()) onResult(finalText.trim())
    }
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    recRef.current = rec
  }, [onResult])

  const start = () => {
    if (!recRef.current) return
    setListening(true)
    try {
      recRef.current.start()
    } catch {
      // ignore double-start
    }
  }
  const stop = () => {
    if (!recRef.current) return
    setListening(false)
    try {
      recRef.current.stop()
    } catch {
      // ignore
    }
  }

  return { supported, listening, start, stop }
}

export default function App() {
  const [authLoading, setAuthLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<{ id: string; email: string | null; username: string | null } | null>(null)
  const [showUsername, setShowUsername] = useState(false)
  const [usernameBusy, setUsernameBusy] = useState(false)
  const [usernameError, setUsernameError] = useState('')
  const [authFatalError, setAuthFatalError] = useState<string>('')

  const [paymentNotice, setPaymentNotice] = useState<string>('')

  const [tool, setTool] = useState<Tool>('symptoms')
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [stageIndex, setStageIndex] = useState(0)
  const [rawOutput, setRawOutput] = useState<string>('')
  const [lastFile, setLastFile] = useState<File | null>(null)
  const [error, setError] = useState<string>('')
  const stageTimer = useRef<number | null>(null)

  const parsed = useMemo(() => parseOutput(rawOutput), [rawOutput])

  const speech = useSpeechToText((t) => {
    setInput((prev) => (prev ? prev + ' ' + t : t))
  })

  useEffect(() => {
    return () => {
      if (stageTimer.current) window.clearInterval(stageTimer.current)
    }
  }, [])

  const loadProfile = useCallback(async (u: User) => {
    // If Supabase env isn't configured (common in preview), avoid throwing and blanking UI.
    // We still allow the app to render and show basic identity from auth user.
    if (!supabaseConfigured) {
      setProfile({ id: u.id, email: u.email ?? null, username: null })
      setShowUsername(false)
      return
    }

    const p = await fetchProfile(u)
    setProfile(p)
    setShowUsername(!p.username)
  }, [])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      // eslint-disable-next-line no-console
      console.log('[auth] init', { supabaseConfigured })
      try {
        if (!supabaseConfigured) {
          setUser(null)
          setProfile(null)
          setShowUsername(false)
          setAuthFatalError('')
          return
        }
        const { data } = await supabase.auth.getSession()
        if (!mounted) return
        const sessUser = data.session?.user ?? null
        // eslint-disable-next-line no-console
        console.log('[auth] session user', !!sessUser)
        setUser(sessUser)
        if (sessUser) await loadProfile(sessUser)
        setAuthFatalError('')
      } catch (e: any) {
        // Never allow auth issues to blank the UI.
        setAuthFatalError(e?.message || 'Failed to initialize authentication')
      } finally {
        if (mounted) setAuthLoading(false)
      }
    })()

    if (!supabaseConfigured) {
      setAuthLoading(false)
      return () => {
        mounted = false
      }
    }

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        // eslint-disable-next-line no-console
        console.log('[auth] state change', event)
        const nextUser = session?.user ?? null
        setUser(nextUser)
        if (nextUser) {
          setAuthLoading(true)
          try {
            await loadProfile(nextUser)
            setAuthFatalError('')
          } finally {
            setAuthLoading(false)
          }
        } else {
          setProfile(null)
          setShowUsername(false)
        }
      } catch (e: any) {
        setAuthFatalError(e?.message || 'Authentication error')
        setAuthLoading(false)
      }
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [loadProfile])

  async function handleLogout() {
    try {
      await signOut()
    } catch {
      // ignore
    }
  }

  async function handleUsernameSubmit(u: string) {
    setUsernameError('')
    if (!user) return

    if (!supabaseConfigured) {
      setUsernameError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
      return
    }
    if (u.length < 3 || u.length > 20) {
      setUsernameError('Username must be 3–20 characters')
      return
    }
    if (!/^[a-zA-Z0-9_]+$/.test(u)) {
      setUsernameError('Username can only contain letters, numbers, and underscores')
      return
    }

    setUsernameBusy(true)
    try {
      const updated = await persistUsername(user.id, u)
      setProfile({
        id: (updated as any).id ?? user.id,
        email: (updated as any).email ?? user.email ?? null,
        username: (updated as any).username ?? u,
      })
      setShowUsername(false)
    } catch (e: any) {
      setUsernameError(e?.message || 'Failed to save username')
    } finally {
      setUsernameBusy(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#05060a] text-white flex items-center justify-center">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl px-6 py-5 shadow-[0_20px_80px_rgba(0,0,0,0.65)]">
          <div className="flex items-center gap-3">
            <motion.div
              className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
            />
            <p className="text-sm text-white/70">Loading session…</p>
          </div>
        </div>
      </div>
    )
  }

  if (authFatalError) {
    return (
      <div className="min-h-screen bg-[#05060a] text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl px-6 py-6 shadow-[0_20px_80px_rgba(0,0,0,0.65)]">
          <p className="text-sm font-semibold text-white/85">App failed to start</p>
          <p className="mt-2 text-xs text-white/55 leading-relaxed">{authFatalError}</p>
          <p className="mt-4 text-[11px] text-white/35">
            If this persists, ensure Supabase environment variables are set.
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <AuthGate
        onAuthed={async (u, p) => {
          setUser(u)
          setProfile(p)
          setShowUsername(!p.username)
        }}
      />
    )
  }

  const quickActions = [
    { id: 'symptoms' as const, label: 'Check symptoms', icon: Activity },
    { id: 'report' as const, label: 'Explain report', icon: FileText },
    { id: 'study' as const, label: 'Study disease', icon: GraduationCap },
    { id: 'image' as const, label: 'Analyze image', icon: ImageIcon },
  ]

  function openPayPal() {
    setPaymentNotice('Redirecting to secure payment...')
    window.setTimeout(() => {
      window.open('https://www.paypal.com/ncp/payment/J9L87E4V7KFCY', '_blank')
    }, 250)

    window.setTimeout(() => setPaymentNotice(''), 3500)
  }

  async function handleGenerate() {
    setError('')
    const content = input.trim()
    if (!content && !lastFile) {
      setError('Tell me what you’re feeling (or attach a file).')
      return
    }

    setBusy(true)
    setStageIndex(0)
    setRawOutput('')
    if (stageTimer.current) window.clearInterval(stageTimer.current)
    stageTimer.current = window.setInterval(() => {
      setStageIndex((i) => (i + 1) % STAGES.length)
    }, 1200)

    try {
      // Keep backend contract: POST /api/generate with JSON
      // (If a file is present, we still send text-only in this trimmed build.)
      const resp = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: tool, prompt: content }),
      })

      if (!resp.ok) {
        const j = await resp.json().catch(() => null)
        throw new Error(j?.error || `Request failed (${resp.status})`)
      }

      const data = await resp.json().catch(() => null)
      const text = (data?.text || data?.result || data?.response || '').toString()
      if (!text) throw new Error('Empty response from server')
      setRawOutput(text)
    } catch (e: any) {
      setError(e?.message || 'Something went wrong')
    } finally {
      setBusy(false)
      if (stageTimer.current) window.clearInterval(stageTimer.current)
      stageTimer.current = null
    }
  }

  return (
    <div className="min-h-screen bg-[#05060a] text-white">
      <UsernameModal
        open={showUsername}
        onSubmit={handleUsernameSubmit}
        busy={usernameBusy}
        error={usernameError}
      />

      <div className="pointer-events-none fixed inset-0">
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

      {/* Hero */}
      <header className="relative mx-auto max-w-6xl px-6 pt-14 pb-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xl flex items-center justify-center shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
            <Stethoscope className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Medyara AI</h1>
            <p className="text-white/55 text-sm sm:text-base">Your intelligent medical companion</p>
          </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-white/80">{profile?.username ? `@${profile.username}` : 'User'}</p>
              <p className="text-xs text-white/40">{profile?.email ?? user.email}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border border-white/10 bg-white/5 hover:bg-white/10 transition text-white/70 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Split Smart UI */}
      <main className="relative mx-auto max-w-6xl px-6 pb-32">
        {/* AdSense: top of dashboard */}
        <div className="mb-6">
          <AdBanner slot="0000000000" className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl" />
        </div>

        {/* PayPal buttons (simple redirect) */}
        <div className="mb-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_18px_60px_rgba(0,0,0,0.45)] overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <p className="text-sm font-medium text-white/80">Upgrade</p>
              <p className="text-xs text-white/40">Secure checkout via PayPal</p>
            </div>
            <div className="p-5 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={openPayPal}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/10 hover:bg-white/14 transition px-4 py-3 text-sm font-semibold"
                >
                  Buy Basic Plan (₱59)
                </button>
                <button
                  type="button"
                  onClick={openPayPal}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/10 hover:bg-white/14 transition px-4 py-3 text-sm font-semibold"
                >
                  Buy Pro Plan (₱119)
                </button>
              </div>

              <AnimatePresence>
                {paymentNotice && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="text-xs text-white/55 mt-2 sm:mt-0"
                  >
                    {paymentNotice}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: thinking */}
          <section className="lg:col-span-5">
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_18px_60px_rgba(0,0,0,0.45)] overflow-hidden">
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.7)]" />
                  <p className="text-sm font-medium text-white/80">AI Thinking</p>
                </div>
                <p className="text-xs text-white/40">Realtime pipeline</p>
              </div>

              <div className="p-5">
                <div className="space-y-3">
                  {STAGES.map((s, i) => (
                    <motion.div
                      key={s.label}
                      initial={false}
                      animate={{
                        opacity: busy ? (i === stageIndex ? 1 : 0.45) : 0.7,
                        y: 0,
                      }}
                      className={`rounded-2xl border ${
                        busy && i === stageIndex ? 'border-white/20 bg-white/10' : 'border-white/10 bg-white/5'
                      } p-4`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium">{s.label}</p>
                          <p className="text-xs text-white/45 mt-1">{s.hint}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-2.5 w-2.5 rounded-full ${
                              busy && i === stageIndex ? 'bg-blue-400' : 'bg-white/20'
                            }`}
                          />
                          <div className="h-5 w-5 rounded-full border border-white/10 bg-white/5 grid place-items-center">
                            <div
                              className={`h-2 w-2 rounded-full ${busy ? 'bg-white/70' : 'bg-white/30'}`}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-4">
                  <p className="text-xs text-white/50 leading-relaxed">
                    Subtle note: Medyara AI is for educational purposes and can be inaccurate. If symptoms are severe or
                    rapidly worsening, seek urgent care.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT: output */}
          <section className="lg:col-span-7">
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_18px_60px_rgba(0,0,0,0.45)] overflow-hidden">
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-300 shadow-[0_0_18px_rgba(168,85,247,0.6)]" />
                  <p className="text-sm font-medium text-white/80">Clinical Summary</p>
                </div>
                <p className="text-xs text-white/40">Cards · structured</p>
              </div>

              <div className="p-5">
                <AnimatePresence mode="popLayout">
                  {busy && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="rounded-2xl border border-white/10 bg-white/5 p-5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-2xl bg-white/10 border border-white/10 grid place-items-center">
                          <motion.div
                            className="h-4 w-4 rounded-full border-2 border-white/35 border-t-white"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white/85">Generating your results</p>
                          <p className="text-xs text-white/45">Structured output is being assembled…</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {!busy && !rawOutput && (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center"
                    >
                      <p className="text-white/70 text-sm">Tell me what you’re feeling to see a structured assessment.</p>
                      <p className="text-white/40 text-xs mt-2">No chat bubbles. Just signal → synthesis → action.</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  {OUTPUT_ORDER.map(({ key, title, icon: Icon }) => {
                    const items = parsed[key]
                    const has = items?.length
                    return (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: rawOutput ? 1 : 0.35, y: 0 }}
                        transition={{ duration: 0.35 }}
                        className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/8 to-white/4 backdrop-blur-xl shadow-[0_14px_50px_rgba(0,0,0,0.35)] overflow-hidden"
                      >
                        <div className="p-5 border-b border-white/10 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-white/10 border border-white/10 grid place-items-center">
                              <Icon className="h-5 w-5 text-white/85" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{title}</p>
                              <p className="text-[11px] text-white/45">Curated highlights</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-5">
                          {!rawOutput ? (
                            <div className="space-y-3">
                              <div className="h-3 w-10/12 rounded bg-white/10" />
                              <div className="h-3 w-9/12 rounded bg-white/10" />
                              <div className="h-3 w-7/12 rounded bg-white/10" />
                            </div>
                          ) : has ? (
                            <ul className="space-y-2">
                              {items.map((t, idx) => (
                                <li key={idx} className="text-sm text-white/75 leading-relaxed flex gap-2">
                                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-white/50 shrink-0" />
                                  <span>{t}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-white/55">No section detected in the response.</p>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {rawOutput && (
                  <details className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <summary className="cursor-pointer text-xs text-white/55 select-none">View raw output</summary>
                    <pre className="mt-3 text-xs text-white/60 whitespace-pre-wrap leading-relaxed">{rawOutput}</pre>
                  </details>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Floating input */}
        <div className="fixed left-0 right-0 bottom-0 z-50">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#05060a] via-[#05060a]/70 to-transparent" />
          <div className="relative mx-auto max-w-6xl px-4 pb-5 pt-8">
            <div className="pointer-events-auto rounded-[28px] border border-white/15 bg-white/7 backdrop-blur-2xl shadow-[0_24px_90px_rgba(0,0,0,0.65)]">
              <div className="p-3 sm:p-4">
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <label className="sr-only" htmlFor="medyara-input">
                      Input
                    </label>
                    <textarea
                      id="medyara-input"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      rows={1}
                      placeholder="Tell me what you're feeling…"
                      className="w-full resize-none rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm sm:text-base text-white placeholder:text-white/35 focus:outline-none focus:border-cyan-300/50 focus:bg-white/8 focus:shadow-[0_0_0_4px_rgba(34,211,238,0.12)] transition"
                    />

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      {/* Quick actions */}
                      <div className="flex flex-wrap gap-2">
                        {quickActions.map((a) => (
                          <button
                            key={a.id}
                            onClick={() => setTool(a.id)}
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs sm:text-sm border transition ${
                              tool === a.id
                                ? 'border-white/20 bg-white/12 text-white'
                                : 'border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/8'
                            }`}
                            type="button"
                          >
                            <a.icon className="h-4 w-4" />
                            {a.label}
                          </button>
                        ))}
                      </div>

                      {/* Attach / mic */}
                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs sm:text-sm border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/8 transition cursor-pointer">
                          <Paperclip className="h-4 w-4" />
                          Upload
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => setLastFile(e.target.files?.[0] ?? null)}
                            accept="image/*,.pdf"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => (speech.listening ? speech.stop() : speech.start())}
                          disabled={!speech.supported}
                          className={`inline-flex items-center justify-center h-10 w-10 rounded-full border transition ${
                            speech.listening
                              ? 'border-cyan-300/40 bg-cyan-300/15 text-white shadow-[0_0_30px_rgba(34,211,238,0.25)]'
                              : 'border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/8'
                          } disabled:opacity-40 disabled:hover:bg-white/5`}
                          aria-label="Microphone"
                          title={speech.supported ? 'Voice input' : 'Voice input not supported in this browser'}
                        >
                          <AudioLines className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={handleGenerate}
                          disabled={busy}
                          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border border-white/15 bg-white/12 hover:bg-white/16 transition disabled:opacity-60"
                        >
                          <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(34,211,238,0.7)]" />
                          {busy ? 'Thinking…' : 'Generate'}
                        </button>
                      </div>
                    </div>

                    {error && <p className="mt-3 text-xs text-red-200/90">{error}</p>}
                    {lastFile && (
                      <p className="mt-2 text-[11px] text-white/40">Attached: {lastFile.name}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
export const useAuth = () => {
  return {
    user: null
  }
}
