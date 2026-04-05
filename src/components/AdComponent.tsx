import { useEffect } from 'react';

export default function AdComponent({ slot, className = '' }: { slot: string, className?: string }) {
  useEffect(() => {
    try {
      const adsbygoogle = (window as any).adsbygoogle || [];
      adsbygoogle.push({});
    } catch (e) {
      console.error("AdSense error", e);
    }
  }, []);

  const tier = localStorage.getItem('medyara_tier');
  if (tier === 'premium' || tier === 'pro') return null;

  return (
    <div className={`w-full overflow-hidden flex justify-center items-center bg-slate-50 border border-slate-200 rounded-xl my-4 min-h-[100px] relative ${className}`}>
      <ins className="adsbygoogle"
           style={{ display: 'block', width: '100%' }}
           data-ad-client="ca-pub-0000000000000000"
           data-ad-slot={slot}
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
      <span className="text-slate-400 text-xs absolute -z-10">Advertisement</span>
    </div>
  );
}
