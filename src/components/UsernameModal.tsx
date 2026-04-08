import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, ArrowRight, User } from 'lucide-react'
import { useMemo, useState } from 'react'

export default function UsernameModal({
  open,
  onSubmit,
  busy,
  error,
}: {
  open: boolean
  onSubmit: (username: string) => void
  busy: boolean
  error: string
}) {
  const [username, setUsername] = useState('')

  const valid = useMemo(() => {
    const u = username.trim()
    if (u.length < 3 || u.length > 20) return false
    if (!/^[a-zA-Z0-9_]+$/.test(u)) return false
    return true
  }, [username])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[999] flex items-center justify-center p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            className="relative w-full max-w-md"
          >
            <div className="rounded-[32px] border border-white/12 bg-white/7 backdrop-blur-2xl shadow-[0_26px_110px_rgba(0,0,0,0.7)] overflow-hidden">
              <div className="p-7 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-white/10 border border-white/10 grid place-items-center">
                    <User className="h-6 w-6 text-white/90" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight">Create your username</h2>
                    <p className="text-white/55 text-sm">Choose a unique handle for your profile.</p>
                  </div>
                </div>
              </div>

              <div className="p-7">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="text-[11px] text-white/35 mb-2">Username</div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/40">@</span>
                    <input
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase())}
                      placeholder="username"
                      className="w-full bg-transparent outline-none text-sm placeholder:text-white/35"
                      autoFocus
                    />
                  </div>
                </div>

                <p className="mt-2 text-[11px] text-white/35">3–20 chars. Letters, numbers, underscores.</p>

                <button
                  type="button"
                  onClick={() => onSubmit(username.trim())}
                  disabled={busy || !valid}
                  className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/10 hover:bg-white/14 transition px-4 py-3.5 font-semibold disabled:opacity-60"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-xs text-red-100 flex items-center gap-2"
                    >
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
