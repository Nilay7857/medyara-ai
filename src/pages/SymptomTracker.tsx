import { useState } from 'react';
import { Calendar, Plus, Activity, Clock, AlertCircle } from 'lucide-react';

export default function SymptomTracker() {
  const [entries] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  // Using showForm for future form modal
  console.log(showForm);

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
            <Activity className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Symptom Tracker</h1>
            <p className="text-slate-500 text-lg">Monitor and track your symptoms over time</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-5 h-5" />
          Add Entry
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Entries</p>
              <p className="text-2xl font-bold text-slate-900">{entries.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-green-100 p-2 rounded-xl text-green-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">This Week</p>
              <p className="text-2xl font-bold text-slate-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-red-100 p-2 rounded-xl text-red-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">High Severity</p>
              <p className="text-2xl font-bold text-slate-900">0</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Symptom History</h2>
        
        <div className="text-center py-12">
          <Activity className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">No symptom entries yet</p>
          <p className="text-slate-400 text-sm mt-2">Start tracking your symptoms to see patterns and insights</p>
        </div>
      </div>
    </div>
  );
}
