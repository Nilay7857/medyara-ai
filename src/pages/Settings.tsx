import { User, Palette } from 'lucide-react';
import { useState } from 'react';

export default function Settings() {
  const [settings, setSettings] = useState({ notifications: true, theme: 'light', language: 'en' });

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 py-8">
      <div className="mb-8 flex items-center gap-4 border-b border-slate-200 pb-6">
        <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
          <User className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Settings</h1>
          <p className="text-slate-500 text-lg">Manage your account and preferences</p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Palette className="w-5 h-5" /> Preferences
          </h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-semibold text-slate-700">Notifications</label>
                <p className="text-sm text-slate-500">Receive updates about new features</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={settings.notifications} onChange={(e) => setSettings(prev => ({ ...prev, notifications: e.target.checked }))} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Language</label>
              <select value={settings.language} onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900">
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
