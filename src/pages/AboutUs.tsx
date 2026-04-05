import { Heart, Users, Shield, Award } from 'lucide-react';

export default function AboutUs() {
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 py-8">
      <div className="mb-8 flex items-center gap-4 border-b border-slate-200 pb-6">
        <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
          <Heart className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">About Medyara AI</h1>
          <p className="text-slate-500 text-lg">Empowering healthcare through intelligent technology</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h2>
        <p className="text-slate-600 leading-relaxed mb-6">Medyara AI is dedicated to democratizing access to medical knowledge through cutting-edge artificial intelligence.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Accessibility</h3>
            <p className="text-slate-500 text-sm">Making medical knowledge available to everyone</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Safety First</h3>
            <p className="text-slate-500 text-sm">Prioritizing patient safety and responsible AI</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <Award className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Excellence</h3>
            <p className="text-slate-500 text-sm">Delivering high-quality medical insights</p>
          </div>
        </div>
      </div>
    </div>
  );
}
