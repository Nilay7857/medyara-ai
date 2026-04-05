import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, Copy, Check, Sparkles, AlertCircle, Mic, MicOff, 
  ImagePlus, X, FileText as FileTextIcon, Link as LinkIcon, 
  Share2, Volume2, VolumeX, Brain, Pill, AlertTriangle, Stethoscope,
  Send, ArrowRight
} from 'lucide-react';

interface GeneratorLayoutProps {
  title: string;
  description: string;
  type: string;
  placeholder: string;
  icon: React.ElementType;
  disclaimer?: string;
  inputLabel: string;
  showLevel?: boolean;
  levelOptions?: string[];
  allowImageUpload?: boolean;
  allowPdfUpload?: boolean;
  allowLinkInput?: boolean;
}

interface AICard {
  icon: React.ElementType;
  title: string;
  content: string[];
  color: string;
}

function generateAICards(type: string): AICard[] {
  const cardSets: Record<string, AICard[]> = {
    'Symptom Checker': [
      { icon: Brain, title: 'Possible Causes', content: ['Common viral infection', 'Stress or fatigue', 'Environmental factors'], color: 'text-blue-400' },
      { icon: Pill, title: 'Remedies', content: ['Rest and hydration', 'OTC pain relief', 'Warm compress'], color: 'text-emerald-400' },
      { icon: AlertTriangle, title: 'Warning Signs', content: ['High fever above 103°F', 'Difficulty breathing', 'Severe pain'], color: 'text-amber-400' },
      { icon: Stethoscope, title: 'See Doctor If', content: ['Symptoms persist 5+ days', 'No improvement', 'New symptoms appear'], color: 'text-rose-400' },
    ],
    'default': [
      { icon: Brain, title: 'Analysis', content: ['Key finding 1', 'Key finding 2', 'Key finding 3'], color: 'text-blue-400' },
      { icon: Sparkles, title: 'Insights', content: ['Insight 1', 'Insight 2', 'Insight 3'], color: 'text-purple-400' },
    ]
  };
  return cardSets[type] || cardSets['default'];
}

export default function GeneratorLayout({ 
  title, description, type, placeholder, icon: Icon, disclaimer, 
  inputLabel, showLevel, levelOptions, allowImageUpload, allowPdfUpload, allowLinkInput 
}: GeneratorLayoutProps) {
  const [prompt, setPrompt] = useState('');
  const [level, setLevel] = useState(levelOptions?.[0] || '');
  const [linkInput, setLinkInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState(0);
  const [aiCards, setAiCards] = useState<AICard[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processingStages = [
    "Understanding your input...",
    "Analyzing patterns...",
    "Generating insights...",
    "Preparing results..."
  ];

  // Voice Recognition
  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice not supported");
      return;
    }
    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = navigator.language || 'en-US';
    recognition.interimResults = true;

    if (isListening) {
      setIsListening(false);
      return;
    }

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e: any) => {
      const transcript = Array.from(e.results).map((r: any) => r[0].transcript).join('');
      setPrompt(transcript);
    };
    recognition.onend = () => setIsListening(false);
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setFileName(file.name);
      };
      reader.readAsDataURL(file);
    } else {
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && !selectedImage && !linkInput.trim()) return;

    setIsProcessing(true);
    setShowResults(false);
    setAiCards([]);

    // Animate through stages
    for (let i = 0; i < processingStages.length; i++) {
      setProcessingStage(i);
      await new Promise(r => setTimeout(r, 600));
    }

    setAiCards(generateAICards(type));
    setIsProcessing(false);
    setShowResults(true);
  };

  const copyResults = () => {
    const text = aiCards.map(c => `${c.title}: ${c.content.join(', ')}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <motion.div 
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px]"
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Icon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{title}</h1>
              <p className="text-white/50">{description}</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {showLevel && levelOptions && (
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Level</label>
                    <select 
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                    >
                      {levelOptions.map(opt => <option key={opt} value={opt} className="bg-slate-900">{opt}</option>)}
                    </select>
                  </div>
                )}

                {allowLinkInput && (
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Link (Optional)</label>
                    <div className="relative">
                      <LinkIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                      <input 
                        type="url"
                        value={linkInput}
                        onChange={(e) => setLinkInput(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                  </div>
                )}

                {(allowImageUpload || allowPdfUpload) && (
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Upload</label>
                    {!selectedImage && !fileName ? (
                      <motion.div 
                        whileHover={{ scale: 1.01 }}
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500/30 hover:bg-blue-500/5 transition-all"
                      >
                        <ImagePlus className="w-8 h-8 text-white/30 mx-auto mb-2" />
                        <p className="text-white/50 text-sm">Click to upload</p>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleFileUpload} 
                          accept="image/*,application/pdf" 
                          className="hidden" 
                        />
                      </motion.div>
                    ) : (
                      <div className="relative rounded-xl overflow-hidden bg-white/5 border border-white/10 p-4">
                        {selectedImage ? (
                          <img src={selectedImage} alt="Preview" className="w-full h-40 object-contain rounded-lg" />
                        ) : (
                          <div className="flex items-center gap-3 py-4 justify-center text-white/60">
                            <FileTextIcon className="w-6 h-6" />
                            <span>{fileName}</span>
                          </div>
                        )}
                        <button 
                          type="button"
                          onClick={() => { setSelectedImage(null); setFileName(null); }}
                          className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white p-1.5 rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-white/70">{inputLabel}</label>
                    <motion.button 
                      type="button"
                      onClick={toggleVoice}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={`p-2 rounded-lg transition-all ${
                        isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white/5 text-white/50 hover:bg-white/10'
                      }`}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </motion.button>
                  </div>
                  <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 min-h-[120px] resize-none"
                  />
                </div>

                <motion.button 
                  type="submit"
                  disabled={isProcessing || (!prompt.trim() && !selectedImage && !linkInput.trim())}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 rounded-xl shadow-lg shadow-purple-500/20 disabled:opacity-30 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Analysis
                    </>
                  )}
                </motion.button>
              </form>
            </div>

            {/* Subtle Disclaimer */}
            <p className="text-white/30 text-xs mt-4 text-center">
              {disclaimer || "AI-generated content for educational purposes only."}
            </p>
          </motion.div>

          {/* Results Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 min-h-[500px] flex flex-col">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    isProcessing ? 'bg-blue-500 animate-pulse' : showResults ? 'bg-emerald-500' : 'bg-white/20'
                  }`} />
                  <span className="text-sm font-medium text-white/70">
                    {isProcessing ? 'Processing...' : showResults ? 'Results Ready' : 'Waiting for input'}
                  </span>
                </div>
                
                {showResults && (
                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => isSpeaking ? window.speechSynthesis.cancel() : speakText(aiCards.map(c => c.content.join(', ')).join('. '))}
                      whileHover={{ scale: 1.05 }}
                      className="p-2 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                    >
                      {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </motion.button>
                    <motion.button
                      onClick={copyResults}
                      whileHover={{ scale: 1.05 }}
                      className="p-2 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </motion.button>
                  </div>
                )}
              </div>

              <div className="flex-1">
                {isProcessing ? (
                  <div className="h-full flex flex-col items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-16 h-16 rounded-full border-2 border-blue-500/30 border-t-blue-500 mb-4"
                    />
                    <p className="text-white/70 font-medium">{processingStages[processingStage]}</p>
                    <div className="flex gap-1 mt-2">
                      {processingStages.map((_, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full transition-all ${i <= processingStage ? 'bg-blue-500' : 'bg-white/20'}`} />
                      ))}
                    </div>
                  </div>
                ) : showResults ? (
                  <div className="space-y-4">
                    {aiCards.map((card, i) => {
                      const CardIcon = card.icon;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/[0.07] transition-all"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center ${card.color}`}>
                              <CardIcon className="w-4 h-4" />
                            </div>
                            <h3 className="text-white font-semibold">{card.title}</h3>
                          </div>
                          <ul className="space-y-1.5">
                            {card.content.map((item, j) => (
                              <li key={j} className="flex items-start gap-2 text-white/60 text-sm">
                                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 ${card.color.replace('text-', 'bg-')}`} />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-white/30">
                    <Icon className="w-16 h-16 mb-4 opacity-30" />
                    <p className="text-lg font-medium">Ready for your input</p>
                    <p className="text-sm">Enter your query to get AI analysis</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
