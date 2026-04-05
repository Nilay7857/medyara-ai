import { Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 py-8">
      <div className="mb-8 flex items-center gap-4 border-b border-slate-200 pb-6">
        <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
          <Shield className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
          <p className="text-slate-500 text-lg">How we protect your data and privacy</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm prose prose-slate max-w-none">
        <h2>Data Protection</h2>
        <p>At Medyara AI, we are committed to protecting your privacy and ensuring the security of your personal information.</p>
        
        <h2>Information We Collect</h2>
        <ul>
          <li>Email address for authentication</li>
          <li>Medical queries and analysis requests</li>
          <li>Usage patterns and feature interactions</li>
        </ul>

        <h2>How We Use Your Information</h2>
        <p>We use your information to provide and improve our services, process medical queries, and enhance user experience.</p>

        <h2>Data Security</h2>
        <p>All data is encrypted in transit and at rest using industry-standard protocols.</p>

        <p className="text-slate-500 text-sm mt-8">Last updated: April 5, 2026</p>
      </div>
    </div>
  );
}
