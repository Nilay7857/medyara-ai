import { useState, useEffect } from 'react';
import { Check, Star, Crown, Heart, Sparkles, Zap, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

// Currency data with conversion rates (base: USD)
const currencyData: Record<string, { symbol: string; rate: number; name: string }> = {
  USD: { symbol: '$', rate: 1, name: 'US Dollar' },
  EUR: { symbol: '€', rate: 0.92, name: 'Euro' },
  GBP: { symbol: '£', rate: 0.79, name: 'British Pound' },
  INR: { symbol: '₹', rate: 83.5, name: 'Indian Rupee' },
  PHP: { symbol: '₱', rate: 56.5, name: 'Philippine Peso' },
  JPY: { symbol: '¥', rate: 149, name: 'Japanese Yen' },
  CNY: { symbol: '¥', rate: 7.24, name: 'Chinese Yuan' },
  KRW: { symbol: '₩', rate: 1320, name: 'Korean Won' },
  AUD: { symbol: 'A$', rate: 1.53, name: 'Australian Dollar' },
  CAD: { symbol: 'C$', rate: 1.36, name: 'Canadian Dollar' },
  SGD: { symbol: 'S$', rate: 1.34, name: 'Singapore Dollar' },
  MYR: { symbol: 'RM', rate: 4.72, name: 'Malaysian Ringgit' },
  THB: { symbol: '฿', rate: 35.8, name: 'Thai Baht' },
  IDR: { symbol: 'Rp', rate: 15700, name: 'Indonesian Rupiah' },
  VND: { symbol: '₫', rate: 24500, name: 'Vietnamese Dong' },
  BRL: { symbol: 'R$', rate: 4.97, name: 'Brazilian Real' },
  MXN: { symbol: 'MX$', rate: 17.2, name: 'Mexican Peso' },
  AED: { symbol: 'د.إ', rate: 3.67, name: 'UAE Dirham' },
  SAR: { symbol: 'ر.س', rate: 3.75, name: 'Saudi Riyal' },
  ZAR: { symbol: 'R', rate: 18.5, name: 'South African Rand' },
  NGN: { symbol: '₦', rate: 1550, name: 'Nigerian Naira' },
  EGP: { symbol: 'E£', rate: 30.9, name: 'Egyptian Pound' },
  PKR: { symbol: '₨', rate: 285, name: 'Pakistani Rupee' },
  BDT: { symbol: '৳', rate: 110, name: 'Bangladeshi Taka' },
  RUB: { symbol: '₽', rate: 92, name: 'Russian Ruble' },
  TRY: { symbol: '₺', rate: 32, name: 'Turkish Lira' },
  PLN: { symbol: 'zł', rate: 4.02, name: 'Polish Zloty' },
  CHF: { symbol: 'CHF', rate: 0.88, name: 'Swiss Franc' },
  SEK: { symbol: 'kr', rate: 10.5, name: 'Swedish Krona' },
  NOK: { symbol: 'kr', rate: 10.8, name: 'Norwegian Krone' },
  DKK: { symbol: 'kr', rate: 6.9, name: 'Danish Krone' },
  NZD: { symbol: 'NZ$', rate: 1.65, name: 'New Zealand Dollar' },
  HKD: { symbol: 'HK$', rate: 7.82, name: 'Hong Kong Dollar' },
  TWD: { symbol: 'NT$', rate: 31.5, name: 'Taiwan Dollar' },
  CLP: { symbol: 'CLP$', rate: 950, name: 'Chilean Peso' },
  COP: { symbol: 'COL$', rate: 4000, name: 'Colombian Peso' },
  ARS: { symbol: 'ARS$', rate: 870, name: 'Argentine Peso' },
  PEN: { symbol: 'S/', rate: 3.75, name: 'Peruvian Sol' },
};

// Country to currency mapping
const countryToCurrency: Record<string, string> = {
  US: 'USD', GB: 'GBP', DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR', BE: 'EUR', AT: 'EUR', IE: 'EUR', PT: 'EUR', GR: 'EUR', FI: 'EUR',
  IN: 'INR', PH: 'PHP', JP: 'JPY', CN: 'CNY', KR: 'KRW', AU: 'AUD', CA: 'CAD', SG: 'SGD', MY: 'MYR', TH: 'THB', ID: 'IDR', VN: 'VND',
  BR: 'BRL', MX: 'MXN', AE: 'AED', SA: 'SAR', ZA: 'ZAR', NG: 'NGN', EG: 'EGP', PK: 'PKR', BD: 'BDT', RU: 'RUB', TR: 'TRY', PL: 'PLN',
  CH: 'CHF', SE: 'SEK', NO: 'NOK', DK: 'DKK', NZ: 'NZD', HK: 'HKD', TW: 'TWD', CL: 'CLP', CO: 'COP', AR: 'ARS', PE: 'PEN',
};

// Base prices in USD
const basePrices = {
  pro: 1.04, // ~₱59 equivalent
  premium: 2.10, // ~₱119 equivalent
};

export default function Pricing() {
  const [currency, setCurrency] = useState('PHP');
  const [detectedCountry, setDetectedCountry] = useState('');
  const [prices, setPrices] = useState({ pro: 59, premium: 119 });

  useEffect(() => {
    detectUserLocation();
  }, []);

  const detectUserLocation = async () => {
    try {
      // Try multiple methods to detect location
      
      // Method 1: Use timezone to guess country
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const timezoneCountryMap: Record<string, string> = {
        'Asia/Manila': 'PH', 'Asia/Kolkata': 'IN', 'Asia/Mumbai': 'IN', 'America/New_York': 'US', 'America/Los_Angeles': 'US',
        'America/Chicago': 'US', 'Europe/London': 'GB', 'Europe/Paris': 'FR', 'Europe/Berlin': 'DE', 'Asia/Tokyo': 'JP',
        'Asia/Shanghai': 'CN', 'Asia/Singapore': 'SG', 'Australia/Sydney': 'AU', 'Asia/Dubai': 'AE', 'Asia/Jakarta': 'ID',
        'Asia/Bangkok': 'TH', 'Asia/Kuala_Lumpur': 'MY', 'Asia/Ho_Chi_Minh': 'VN', 'Asia/Seoul': 'KR', 'Asia/Hong_Kong': 'HK',
        'Asia/Taipei': 'TW', 'Europe/Moscow': 'RU', 'Europe/Istanbul': 'TR', 'America/Sao_Paulo': 'BR', 'America/Mexico_City': 'MX',
        'Africa/Lagos': 'NG', 'Africa/Cairo': 'EG', 'Africa/Johannesburg': 'ZA', 'Asia/Karachi': 'PK', 'Asia/Dhaka': 'BD',
      };
      
      let countryCode = timezoneCountryMap[timezone] || '';
      
      // Method 2: Try to get from browser language
      if (!countryCode) {
        const lang = navigator.language || (navigator as any).userLanguage || '';
        if (lang.includes('-')) {
          countryCode = lang.split('-')[1].toUpperCase();
        }
      }

      // Method 3: Try IP-based geolocation (free API)
      if (!countryCode) {
        try {
          const response = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
          const data = await response.json();
          if (data.country_code) {
            countryCode = data.country_code;
          }
        } catch {
          // Fallback to PHP if detection fails
          countryCode = 'PH';
        }
      }

      setDetectedCountry(countryCode);
      const detectedCurrency = countryToCurrency[countryCode] || 'USD';
      setCurrency(detectedCurrency);
      updatePrices(detectedCurrency);
    } catch {
      // Default to PHP
      setCurrency('PHP');
      updatePrices('PHP');
    }
  };

  const updatePrices = (currencyCode: string) => {
    const currencyInfo = currencyData[currencyCode] || currencyData.USD;
    const rate = currencyInfo.rate;
    
    setPrices({
      pro: Math.round(basePrices.pro * rate),
      premium: Math.round(basePrices.premium * rate),
    });
  };

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
    updatePrices(newCurrency);
  };

  const formatPrice = (amount: number) => {
    const currencyInfo = currencyData[currency] || currencyData.USD;
    
    // Format based on currency
    if (['JPY', 'KRW', 'VND', 'IDR'].includes(currency)) {
      return `${currencyInfo.symbol}${amount.toLocaleString()}`;
    }
    return `${currencyInfo.symbol}${amount}`;
  };

  const plans = [
    {
      name: 'Free',
      price: 0,
      period: 'forever',
      description: 'Try Medyara AI',
      icon: Heart,
      gradient: 'from-slate-500 to-slate-600',
      features: [
        '12 AI queries per day',
        'Basic symptom checker',
        'Emergency guide access',
        'Community support',
      ],
      limitations: ['Limited daily usage', 'Basic features only'],
      cta: 'Get Started Free',
    },
    {
      name: 'Pro',
      price: prices.pro,
      period: 'month',
      description: 'For health enthusiasts',
      icon: Star,
      gradient: 'from-blue-500 to-indigo-600',
      popular: true,
      features: [
        'Unlimited AI queries',
        'All clinical tools',
        'Image analysis',
        'Report explainer',
        'Study mode (all levels)',
        'Symptom tracker',
        'Priority support',
        'Ad-free experience',
      ],
      limitations: [],
      cta: 'Upgrade to Pro',
    },
    {
      name: 'Premium',
      price: prices.premium,
      period: 'month',
      description: 'Ultimate medical AI',
      icon: Crown,
      gradient: 'from-purple-500 to-pink-600',
      features: [
        'Everything in Pro',
        'Advanced AI models',
        'Bulk analysis',
        'Export reports (PDF)',
        'Family accounts (5 users)',
        'API access',
        'Dedicated support',
        'Early access to features',
      ],
      limitations: [],
      cta: 'Go Premium',
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden py-12">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="w-4 h-4" />
            Simple, Transparent Pricing
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-6">
            Unlock the full potential of AI-powered health insights
          </p>

          {/* Currency Selector */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Globe className="w-4 h-4" />
              <span>Detected: {detectedCountry || 'Auto'}</span>
            </div>
            <select
              value={currency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              {Object.entries(currencyData).map(([code, data]) => (
                <option key={code} value={code}>
                  {data.symbol} {code} - {data.name}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className={`relative bg-white/80 backdrop-blur-sm border rounded-3xl p-8 shadow-xl transition-all ${
                  plan.popular 
                    ? 'border-blue-500 ring-2 ring-blue-500/20 scale-105 z-10' 
                    : 'border-slate-200/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-1.5 rounded-full text-sm font-bold shadow-lg">
                    Most Popular
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-br ${plan.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <p className="text-slate-500 text-sm">{plan.description}</p>
                </div>

                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-slate-900">
                      {plan.price === 0 ? 'Free' : formatPrice(plan.price)}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-slate-500">/{plan.period}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${plan.gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-slate-700 text-sm">{feature}</span>
                    </div>
                  ))}
                  {plan.limitations.map((limitation, i) => (
                    <div key={i} className="flex items-start gap-3 opacity-50">
                      <div className="w-5 h-5 rounded-full border border-slate-300 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-500 text-sm">{limitation}</span>
                    </div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-4 rounded-2xl font-bold transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {plan.cta}
                </motion.button>
              </motion.div>
            );
          })}
        </div>

        {/* Features Comparison */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-8 shadow-xl"
        >
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
            Why Choose Medyara AI?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Instant Analysis</h3>
              <p className="text-slate-600 text-sm">Get AI-powered health insights in seconds, not hours</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Works Everywhere</h3>
              <p className="text-slate-600 text-sm">Available in all languages, accessible worldwide</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Check className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Trusted & Secure</h3>
              <p className="text-slate-600 text-sm">Your health data is encrypted and never shared</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
