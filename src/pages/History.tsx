import { History as HistoryIcon } from 'lucide-react';

export default function History() {
  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 py-8">
      <div className="mb-8 flex items-center gap-4">
        <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
          <HistoryIcon className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Analysis History</h1>
          <p className="text-slate-500 text-lg">Review your previous medical analyses</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center">
        <HistoryIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-900 mb-2">No history yet</h3>
        <p className="text-slate-500">Start using Medyara AI to see your analysis history here</p>
      </div>
    </div>
  );
}
