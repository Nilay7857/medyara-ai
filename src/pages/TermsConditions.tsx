import { FileText } from 'lucide-react';

export default function TermsConditions() {
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 py-8">
      <div className="mb-8 flex items-center gap-4 border-b border-slate-200 pb-6">
        <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
          <FileText className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Terms & Conditions</h1>
          <p className="text-slate-500 text-lg">Please read these terms carefully</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm prose prose-slate max-w-none">
        <h2>Agreement to Terms</h2>
        <p>By accessing and using Medyara AI, you accept and agree to be bound by these terms.</p>
        
        <h2>Medical Disclaimer</h2>
        <p className="text-red-600 font-semibold">Medyara AI is NOT a substitute for professional medical advice, diagnosis, or treatment.</p>

        <h2>Use License</h2>
        <p>Permission is granted to use Medyara AI for personal, non-commercial purposes only.</p>

        <h2>Limitation of Liability</h2>
        <p>Medyara AI shall not be liable for any medical outcomes based on information provided by our platform.</p>

        <p className="text-slate-500 text-sm mt-8">Last updated: April 5, 2026</p>
      </div>
    </div>
  );
}
