import { useState, useEffect } from 'react';
import { AlertTriangle, Phone, Heart, Thermometer, Droplets, Zap, Skull, Bone, Pill, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

// Global emergency numbers database
const emergencyNumbers: Record<string, { police: string; ambulance: string; fire: string; universal: string; name: string }> = {
  // North America
  US: { police: '911', ambulance: '911', fire: '911', universal: '911', name: 'United States' },
  CA: { police: '911', ambulance: '911', fire: '911', universal: '911', name: 'Canada' },
  MX: { police: '911', ambulance: '911', fire: '911', universal: '911', name: 'Mexico' },
  
  // Europe (EU uses 112)
  GB: { police: '999', ambulance: '999', fire: '999', universal: '112', name: 'United Kingdom' },
  DE: { police: '110', ambulance: '112', fire: '112', universal: '112', name: 'Germany' },
  FR: { police: '17', ambulance: '15', fire: '18', universal: '112', name: 'France' },
  IT: { police: '113', ambulance: '118', fire: '115', universal: '112', name: 'Italy' },
  ES: { police: '091', ambulance: '061', fire: '080', universal: '112', name: 'Spain' },
  NL: { police: '112', ambulance: '112', fire: '112', universal: '112', name: 'Netherlands' },
  BE: { police: '101', ambulance: '112', fire: '112', universal: '112', name: 'Belgium' },
  PT: { police: '112', ambulance: '112', fire: '112', universal: '112', name: 'Portugal' },
  PL: { police: '997', ambulance: '999', fire: '998', universal: '112', name: 'Poland' },
  SE: { police: '112', ambulance: '112', fire: '112', universal: '112', name: 'Sweden' },
  NO: { police: '112', ambulance: '113', fire: '110', universal: '112', name: 'Norway' },
  DK: { police: '112', ambulance: '112', fire: '112', universal: '112', name: 'Denmark' },
  FI: { police: '112', ambulance: '112', fire: '112', universal: '112', name: 'Finland' },
  AT: { police: '133', ambulance: '144', fire: '122', universal: '112', name: 'Austria' },
  CH: { police: '117', ambulance: '144', fire: '118', universal: '112', name: 'Switzerland' },
  IE: { police: '999', ambulance: '999', fire: '999', universal: '112', name: 'Ireland' },
  GR: { police: '100', ambulance: '166', fire: '199', universal: '112', name: 'Greece' },
  RU: { police: '102', ambulance: '103', fire: '101', universal: '112', name: 'Russia' },
  UA: { police: '102', ambulance: '103', fire: '101', universal: '112', name: 'Ukraine' },
  TR: { police: '155', ambulance: '112', fire: '110', universal: '112', name: 'Turkey' },
  
  // Asia Pacific
  IN: { police: '100', ambulance: '102', fire: '101', universal: '112', name: 'India' },
  PH: { police: '117', ambulance: '911', fire: '911', universal: '911', name: 'Philippines' },
  JP: { police: '110', ambulance: '119', fire: '119', universal: '110', name: 'Japan' },
  CN: { police: '110', ambulance: '120', fire: '119', universal: '110', name: 'China' },
  KR: { police: '112', ambulance: '119', fire: '119', universal: '112', name: 'South Korea' },
  AU: { police: '000', ambulance: '000', fire: '000', universal: '000', name: 'Australia' },
  NZ: { police: '111', ambulance: '111', fire: '111', universal: '111', name: 'New Zealand' },
  SG: { police: '999', ambulance: '995', fire: '995', universal: '999', name: 'Singapore' },
  MY: { police: '999', ambulance: '999', fire: '994', universal: '999', name: 'Malaysia' },
  TH: { police: '191', ambulance: '1669', fire: '199', universal: '191', name: 'Thailand' },
  ID: { police: '110', ambulance: '118', fire: '113', universal: '112', name: 'Indonesia' },
  VN: { police: '113', ambulance: '115', fire: '114', universal: '113', name: 'Vietnam' },
  PK: { police: '15', ambulance: '115', fire: '16', universal: '15', name: 'Pakistan' },
  BD: { police: '999', ambulance: '999', fire: '999', universal: '999', name: 'Bangladesh' },
  HK: { police: '999', ambulance: '999', fire: '999', universal: '999', name: 'Hong Kong' },
  TW: { police: '110', ambulance: '119', fire: '119', universal: '110', name: 'Taiwan' },
  
  // Middle East
  AE: { police: '999', ambulance: '998', fire: '997', universal: '999', name: 'UAE' },
  SA: { police: '999', ambulance: '997', fire: '998', universal: '911', name: 'Saudi Arabia' },
  IL: { police: '100', ambulance: '101', fire: '102', universal: '100', name: 'Israel' },
  EG: { police: '122', ambulance: '123', fire: '180', universal: '122', name: 'Egypt' },
  
  // Africa
  ZA: { police: '10111', ambulance: '10177', fire: '10111', universal: '112', name: 'South Africa' },
  NG: { police: '199', ambulance: '199', fire: '199', universal: '112', name: 'Nigeria' },
  KE: { police: '999', ambulance: '999', fire: '999', universal: '112', name: 'Kenya' },
  
  // South America
  BR: { police: '190', ambulance: '192', fire: '193', universal: '190', name: 'Brazil' },
  AR: { police: '101', ambulance: '107', fire: '100', universal: '911', name: 'Argentina' },
  CL: { police: '133', ambulance: '131', fire: '132', universal: '131', name: 'Chile' },
  CO: { police: '123', ambulance: '123', fire: '123', universal: '123', name: 'Colombia' },
  PE: { police: '105', ambulance: '117', fire: '116', universal: '105', name: 'Peru' },
};

// Timezone to country mapping for detection
const timezoneToCountry: Record<string, string> = {
  'Asia/Manila': 'PH', 'Asia/Kolkata': 'IN', 'Asia/Mumbai': 'IN', 'America/New_York': 'US', 'America/Los_Angeles': 'US',
  'America/Chicago': 'US', 'America/Denver': 'US', 'Europe/London': 'GB', 'Europe/Paris': 'FR', 'Europe/Berlin': 'DE',
  'Europe/Rome': 'IT', 'Europe/Madrid': 'ES', 'Europe/Amsterdam': 'NL', 'Europe/Brussels': 'BE', 'Europe/Lisbon': 'PT',
  'Europe/Warsaw': 'PL', 'Europe/Stockholm': 'SE', 'Europe/Oslo': 'NO', 'Europe/Copenhagen': 'DK', 'Europe/Helsinki': 'FI',
  'Europe/Vienna': 'AT', 'Europe/Zurich': 'CH', 'Europe/Dublin': 'IE', 'Europe/Athens': 'GR', 'Europe/Moscow': 'RU',
  'Europe/Kiev': 'UA', 'Europe/Istanbul': 'TR', 'Asia/Tokyo': 'JP', 'Asia/Shanghai': 'CN', 'Asia/Hong_Kong': 'HK',
  'Asia/Singapore': 'SG', 'Asia/Kuala_Lumpur': 'MY', 'Asia/Bangkok': 'TH', 'Asia/Jakarta': 'ID', 'Asia/Ho_Chi_Minh': 'VN',
  'Asia/Seoul': 'KR', 'Asia/Taipei': 'TW', 'Asia/Dubai': 'AE', 'Asia/Riyadh': 'SA', 'Asia/Jerusalem': 'IL',
  'Asia/Karachi': 'PK', 'Asia/Dhaka': 'BD', 'Africa/Cairo': 'EG', 'Africa/Johannesburg': 'ZA', 'Africa/Lagos': 'NG',
  'Africa/Nairobi': 'KE', 'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU', 'Pacific/Auckland': 'NZ',
  'America/Sao_Paulo': 'BR', 'America/Buenos_Aires': 'AR', 'America/Santiago': 'CL', 'America/Bogota': 'CO',
  'America/Lima': 'PE', 'America/Mexico_City': 'MX', 'America/Toronto': 'CA', 'America/Vancouver': 'CA',
};

export default function EmergencyGuide() {
  const [userCountry, setUserCountry] = useState<string>('');
  const [emergencyInfo, setEmergencyInfo] = useState(emergencyNumbers['US']);
  const [isDetecting, setIsDetecting] = useState(true);

  useEffect(() => {
    detectUserCountry();
  }, []);

  const detectUserCountry = async () => {
    setIsDetecting(true);
    let detectedCountry = '';

    try {
      // Method 1: Timezone detection
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      detectedCountry = timezoneToCountry[timezone] || '';

      // Method 2: Browser language fallback
      if (!detectedCountry) {
        const lang = navigator.language || '';
        if (lang.includes('-')) {
          const countryFromLang = lang.split('-')[1].toUpperCase();
          if (emergencyNumbers[countryFromLang]) {
            detectedCountry = countryFromLang;
          }
        }
      }

      // Method 3: IP-based geolocation (fallback)
      if (!detectedCountry) {
        try {
          const response = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
          const data = await response.json();
          if (data.country_code && emergencyNumbers[data.country_code]) {
            detectedCountry = data.country_code;
          }
        } catch {
          // Use default
        }
      }

      // Fallback to US if nothing detected
      if (!detectedCountry || !emergencyNumbers[detectedCountry]) {
        detectedCountry = 'US';
      }

      setUserCountry(detectedCountry);
      setEmergencyInfo(emergencyNumbers[detectedCountry]);
    } catch {
      setUserCountry('US');
      setEmergencyInfo(emergencyNumbers['US']);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  const emergencies = [
    { title: "Heart Attack", symptoms: ["Chest pain or pressure", "Shortness of breath", "Pain in arms, back, neck"], actions: ["Call emergency immediately", "Chew aspirin if not allergic", "Stay calm and rest"], icon: Heart, severity: "high" },
    { title: "Stroke", symptoms: ["Sudden numbness/weakness", "Confusion or trouble speaking", "Vision problems"], actions: ["Call emergency immediately", "Note time symptoms started", "Do not give food/drink"], icon: Skull, severity: "high" },
    { title: "Severe Allergic Reaction", symptoms: ["Difficulty breathing", "Swelling of face/throat", "Hives or rash"], actions: ["Call emergency services", "Use EpiPen if available", "Lie down with legs elevated"], icon: AlertTriangle, severity: "high" },
    { title: "Choking", symptoms: ["Inability to speak or breathe", "Clutching throat", "Bluish skin color"], actions: ["Perform Heimlich maneuver", "Call emergency if unsuccessful"], icon: Zap, severity: "high" },
    { title: "Severe Bleeding", symptoms: ["Blood soaking through clothing", "Blood spurting", "Pale/cold skin"], actions: ["Apply direct pressure", "Elevate injured area", "Call emergency services"], icon: Droplets, severity: "high" },
    { title: "Burns", symptoms: ["Red, blistered skin", "White/charred skin", "Severe pain"], actions: ["Cool with running water", "Remove jewelry/clothing", "Cover with clean cloth"], icon: Thermometer, severity: "medium" },
    { title: "Broken Bones", symptoms: ["Severe pain", "Swelling/bruising", "Deformity"], actions: ["Immobilize the area", "Apply ice pack", "Seek medical attention"], icon: Bone, severity: "medium" },
    { title: "Poisoning", symptoms: ["Nausea/vomiting", "Difficulty breathing", "Confusion"], actions: ["Call poison control", "Do not induce vomiting", "Save container/pill bottle"], icon: Pill, severity: "high" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center gap-4 border-b border-slate-200 pb-6"
      >
        <div className="bg-red-100 p-3 rounded-2xl text-red-600">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Emergency Guide</h1>
          <p className="text-slate-500 text-lg">Quick reference for medical emergencies</p>
        </div>
      </motion.div>

      {/* Smart Emergency Number Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-red-500 to-rose-600 rounded-3xl p-6 mb-8 text-white shadow-xl shadow-red-500/25"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <MapPin className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white/80 text-sm">
                  {isDetecting ? 'Detecting your location...' : `Emergency number for ${emergencyInfo.name}`}
                </span>
                {!isDetecting && (
                  <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-medium">{userCountry}</span>
                )}
              </div>
              <div className="text-4xl md:text-5xl font-bold tracking-wider">
                {isDetecting ? '...' : emergencyInfo.universal}
              </div>
              <p className="text-white/80 text-sm mt-1">
                Universal emergency number • Available 24/7
              </p>
            </div>
          </div>
          
          <motion.button
            onClick={() => handleCall(emergencyInfo.universal)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 bg-white text-red-600 font-bold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all"
          >
            <Phone className="w-6 h-6" />
            Call Emergency
          </motion.button>
        </div>

        {/* Additional Numbers */}
        {!isDetecting && (
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
            <button 
              onClick={() => handleCall(emergencyInfo.police)}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-3 hover:bg-white/20 transition-all text-center"
            >
              <p className="text-white/70 text-xs mb-1">Police</p>
              <p className="text-xl font-bold">{emergencyInfo.police}</p>
            </button>
            <button 
              onClick={() => handleCall(emergencyInfo.ambulance)}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-3 hover:bg-white/20 transition-all text-center"
            >
              <p className="text-white/70 text-xs mb-1">Ambulance</p>
              <p className="text-xl font-bold">{emergencyInfo.ambulance}</p>
            </button>
            <button 
              onClick={() => handleCall(emergencyInfo.fire)}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-3 hover:bg-white/20 transition-all text-center"
            >
              <p className="text-white/70 text-xs mb-1">Fire</p>
              <p className="text-xl font-bold">{emergencyInfo.fire}</p>
            </button>
          </div>
        )}
      </motion.div>

      {/* Warning Notice */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-amber-50 border border-amber-200 rounded-3xl p-6 mb-8"
      >
        <div className="flex items-start gap-3 text-amber-800">
          <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-lg mb-2">⚠️ Important Notice</h3>
            <p className="text-sm leading-relaxed">
              In a real emergency, always call your local emergency services immediately. 
              This guide is for reference only and should not delay seeking professional medical help.
              If the detected number is incorrect, dial <strong>112</strong> (works in most countries globally).
            </p>
          </div>
        </div>
      </motion.div>

      {/* Emergency Conditions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {emergencies.map((emergency, index) => {
          const Icon = emergency.icon;
          return (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              whileHover={{ y: -4 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-xl ${emergency.severity === 'high' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{emergency.title}</h3>
                {emergency.severity === 'high' && (
                  <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">URGENT</span>
                )}
              </div>
              
              <div className="mb-4">
                <h4 className="font-semibold text-slate-800 mb-2 text-sm uppercase tracking-wide">Symptoms</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  {emergency.symptoms.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-800 mb-2 text-sm uppercase tracking-wide">Immediate Actions</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  {emergency.actions.map((a, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 shrink-0" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Global Emergency Info */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-blue-50 border border-blue-200 rounded-3xl p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
            <Phone className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Global Emergency Numbers</h2>
            <p className="text-slate-600">Common emergency numbers worldwide</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
            <p className="text-slate-500 text-sm mb-1">International</p>
            <p className="text-3xl font-bold text-blue-600">112</p>
            <p className="text-xs text-slate-400 mt-1">EU, Asia, Africa</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
            <p className="text-slate-500 text-sm mb-1">USA & Canada</p>
            <p className="text-3xl font-bold text-red-600">911</p>
            <p className="text-xs text-slate-400 mt-1">North America</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
            <p className="text-slate-500 text-sm mb-1">UK</p>
            <p className="text-3xl font-bold text-indigo-600">999</p>
            <p className="text-xs text-slate-400 mt-1">United Kingdom</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
            <p className="text-slate-500 text-sm mb-1">Australia</p>
            <p className="text-3xl font-bold text-green-600">000</p>
            <p className="text-xs text-slate-400 mt-1">Australia, NZ: 111</p>
          </div>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          💡 Tip: <strong>112</strong> works from any mobile phone in most countries, even without a SIM card
        </p>
      </motion.div>
    </div>
  );
}
