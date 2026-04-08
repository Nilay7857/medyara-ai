import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, BookOpen, FileSearch, ScanFace, Mic, MicOff, Send, 
  Sparkles, Brain, Pill, AlertTriangle, Stethoscope, Volume2, VolumeX,
  ArrowRight, Zap, Shield, Heart, FileText
} from 'lucide-react';


// AI Response Card Types
interface AICard {
  type: 'causes' | 'remedies' | 'warnings' | 'doctor';
  icon: React.ElementType;
  title: string;
  content: string[];
  color: string;
  gradient: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
const user = null;
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState(0);
  const [aiCards, setAiCards] = useState<AICard[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processingStages = [
    { text: "Understanding your symptoms...", icon: Brain },
    { text: "Analyzing medical patterns...", icon: Activity },
    { text: "Checking possible causes...", icon: FileSearch },
    { text: "Generating personalized advice...", icon: Sparkles },
  ];

  const quickActions = [
    { label: "Check symptoms", icon: Activity, path: "/symptom-checker", color: "from-rose-500 to-pink-600" },
    { label: "Explain report", icon: FileText, path: "/report-explainer", color: "from-blue-500 to-cyan-600" },
    { label: "Study disease", icon: BookOpen, path: "/study-mode", color: "from-emerald-500 to-teal-600" },
    { label: "Analyze image", icon: ScanFace, path: "/image-analyzer", color: "from-purple-500 to-violet-600" },
  ];

  // Voice Recognition
  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Voice not supported. Try Chrome.");
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = navigator.language || 'en-US';
    recognition.interimResults = true;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      return;
    }

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e: any) => {
      const transcript = Array.from(e.results).map((r: any) => r[0].transcript).join('');
      setQuery(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.start();
  };

  // Text-to-Speech
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  // Process Query
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim() || isProcessing) return;

    setIsProcessing(true);
    setShowResults(false);
    setAiCards([]);

    // Animate through processing stages
    for (let i = 0; i < processingStages.length; i++) {
      setProcessingStage(i);
      await new Promise(r => setTimeout(r, 800));
    }

    // Generate AI response cards
    const cards: AICard[] = [
      {
        type: 'causes',
        icon: Brain,
        title: 'Possible Causes',
        content: [
          'Common viral infection',
          'Stress or fatigue related',
          'Environmental factors',
          'Seasonal changes'
        ],
        color: 'text-blue-400',
        gradient: 'from-blue-500/20 to-cyan-500/20'
      },
      {
        type: 'remedies',
        icon: Pill,
        title: 'What You Can Do',
        content: [
          'Rest and stay hydrated',
          'Take OTC pain relief if needed',
          'Warm compress for comfort',
          'Get 7-8 hours of sleep'
        ],
        color: 'text-emerald-400',
        gradient: 'from-emerald-500/20 to-teal-500/20'
      },
      {
        type: 'warnings',
        icon: AlertTriangle,
        title: 'Warning Signs',
        content: [
          'High fever above 103°F',
          'Difficulty breathing',
          'Severe persistent pain',
          'Symptoms worsening rapidly'
        ],
        color: 'text-amber-400',
        gradient: 'from-amber-500/20 to-orange-500/20'
      },
      {
        type: 'doctor',
        icon: Stethoscope,
        title: 'When to See Doctor',
        content: [
          'Symptoms persist beyond 5-7 days',
          'No improvement with home care',
          'New or unusual symptoms appear',
          'You have underlying conditions'
        ],
        color: 'text-rose-400',
        gradient: 'from-rose-500/20 to-pink-500/20'
      }
    ];

    setAiCards(cards);
    setIsProcessing(false);
    setShowResults(true);
  };

  const handleQuickSuggestion = (text: string) => {
    setQuery(text);
    setTimeout(() => handleSubmit(), 100);
  };

  return (
    <div className="min-h-screen relative">
      {/* Premium Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        
        {/* Animated Gradient Orbs */}
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ x: [0, -40, 0], y: [0, 40, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ x: [0, 30, 0], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-[120px]"
        />

        {/* Subtle Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:80px_80px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 relative">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10 px-4 py-2 rounded-full text-sm text-white/70 mb-6 backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4 text-blue-400" />
            Welcome back, {user?.username || user?.email?.split('@')[0]}
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              Medyara
            </span>
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> AI</span>
          </h1>
          
          <p className="text-xl text-white/50 max-w-xl mx-auto">
            Your intelligent health companion
          </p>
        </motion.div>

        {/* Main Input Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-3xl mx-auto mb-8"
        >
          <form onSubmit={handleSubmit}>
            <div className="relative group">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
              
              <div className="relative backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-2 flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tell me what you're feeling..."
                  className="flex-1 bg-transparent px-6 py-4 text-lg text-white placeholder:text-white/30 focus:outline-none"
                  disabled={isProcessing}
                />
                
                {/* Voice Button */}
                <motion.button
                  type="button"
                  onClick={toggleVoice}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-3 rounded-xl transition-all ${
                    isListening 
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/50 animate-pulse' 
                      : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </motion.button>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={!query.trim() || isProcessing}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-xl shadow-lg shadow-purple-500/30 disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-xl transition-all"
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </form>

          {/* Quick Suggestions */}
          {!showResults && !isProcessing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center gap-3 mt-6"
            >
              {["I have a headache", "Feeling tired", "Stomach pain", "Sore throat"].map((text, i) => (
                <motion.button
                  key={text}
                  onClick={() => handleQuickSuggestion(text)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                >
                  {text}
                </motion.button>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Processing Animation */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* AI Thinking Panel */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">AI Processing</h3>
                      <p className="text-white/40 text-sm">Analyzing your query</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {processingStages.map((stage, i) => {
                      const Icon = stage.icon;
                      const isActive = i === processingStage;
                      const isDone = i < processingStage;
                      
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0.3 }}
                          animate={{ opacity: isActive || isDone ? 1 : 0.3 }}
                          className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                            isActive ? 'bg-blue-500/10 border border-blue-500/20' : ''
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isDone ? 'bg-emerald-500/20 text-emerald-400' :
                            isActive ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-white/30'
                          }`}>
                            {isDone ? (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>✓</motion.div>
                            ) : isActive ? (
                              <Icon className="w-4 h-4 animate-pulse" />
                            ) : (
                              <Icon className="w-4 h-4" />
                            )}
                          </div>
                          <span className={`text-sm ${isActive ? 'text-white' : isDone ? 'text-white/60' : 'text-white/30'}`}>
                            {stage.text}
                          </span>
                          {isActive && (
                            <div className="ml-auto flex gap-1">
                              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Preview Panel */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center justify-center">
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-blue-500/30 border-t-blue-500"
                    />
                    <p className="text-white/50">Generating results...</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Response Cards */}
        <AnimatePresence>
          {showResults && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-5xl mx-auto"
            >
              {/* Speak Button */}
              <div className="flex justify-end mb-4">
                <motion.button
                  onClick={() => isSpeaking ? stopSpeaking() : speakText(aiCards.map(c => c.title + ': ' + c.content.join(', ')).join('. '))}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${
                    isSpeaking 
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                      : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  {isSpeaking ? 'Stop' : 'Listen'}
                </motion.button>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiCards.map((card, index) => {
                  const Icon = card.icon;
                  return (
                    <motion.div
                      key={card.type}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -4, scale: 1.02 }}
                      className={`backdrop-blur-xl bg-gradient-to-br ${card.gradient} border border-white/10 rounded-3xl p-6 hover:border-white/20 transition-all`}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center ${card.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <h3 className="text-white font-semibold text-lg">{card.title}</h3>
                      </div>
                      
                      <ul className="space-y-2">
                        {card.content.map((item, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 + i * 0.05 }}
                            className="flex items-start gap-2 text-white/70 text-sm"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full mt-1.5 ${card.color.replace('text-', 'bg-')}`} />
                            {item}
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  );
                })}
              </div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center mt-8"
              >
                <button
                  onClick={() => navigate('/symptom-checker')}
                  className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Get detailed analysis
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Actions */}
        {!showResults && !isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-16"
          >
            <h2 className="text-center text-white/40 text-sm font-medium uppercase tracking-wider mb-6">
              Quick Actions
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {quickActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.label}
                    onClick={() => navigate(action.path)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-white/20 transition-all"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-white/80 text-sm font-medium">{action.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Features Banner */}
        {!showResults && !isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-16 flex justify-center gap-8 text-white/30 text-sm"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Instant Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Private & Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span>24/7 Available</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
