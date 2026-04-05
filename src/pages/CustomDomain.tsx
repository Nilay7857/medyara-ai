import { Globe, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function CustomDomain() {
  const [domain, setDomain] = useState('');

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 py-8">
      <div className="mb-8 flex items-center gap-4 border-b border-slate-200 pb-6">
        <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
          <Globe className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Custom Domain</h1>
          <p className="text-slate-500 text-lg">Set up your own domain for Medyara AI</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Domain Configuration</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Your Domain</label>
            <input type="text" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="e.g. med.yourdomain.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900" />
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all">Set Custom Domain</button>
        </div>
      </div>

      <div className="mt-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-4">Requirements</h3>
        <ul className="space-y-3 text-sm text-slate-600">
          <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />Premium subscription</li>
          <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />Domain ownership and DNS access</li>
          <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />SSL certificate (automatically provided)</li>
        </ul>
      </div>
    </div>
  );
}
