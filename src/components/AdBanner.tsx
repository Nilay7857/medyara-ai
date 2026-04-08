import { useEffect, useId, useRef } from 'react'

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

type Props = {
  /** Replace later with your real AdSense publisher id (e.g. ca-pub-xxxxxxxxxxxx) */
  client?: string
  /** Ad slot id from AdSense */
  slot: string
  className?: string
  style?: React.CSSProperties
}

export default function AdBanner({
  client = 'YOUR_ADSENSE_ID',
  slot,
  className = '',
  style,
}: Props) {
  const id = useId()
  const pushedRef = useRef(false)

  useEffect(() => {
    // Prevent duplicate pushes for the same mounted component
    if (pushedRef.current) return
    pushedRef.current = true

    try {
      // If the script hasn't loaded yet, this will throw; we silently ignore.
      window.adsbygoogle = window.adsbygoogle || []
      window.adsbygoogle.push({})
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[adsense] adsbygoogle push failed', e)
    }
  }, [])

  // Keep container minimal + responsive. If ads don't load, it just collapses visually.
  return (
    <div
      className={`w-full overflow-hidden ${className}`}
      style={{
        minHeight: 90,
        ...style,
      }}
      aria-label="Advertisement"
    >
      <ins
        key={id}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', minHeight: 90 }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}
