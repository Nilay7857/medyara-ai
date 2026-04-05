import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SymptomChecker from './pages/SymptomChecker';
import StudyMode from './pages/StudyMode';
import MCQGenerator from './pages/MCQGenerator';
import EmergencyGuide from './pages/EmergencyGuide';
import ReportExplainer from './pages/ReportExplainer';
import VisualLearning from './pages/VisualLearning';
import ExplainLike5 from './pages/ExplainLike5';
import ImageAnalyzer from './pages/ImageAnalyzer';
import MCQSolver from './pages/MCQSolver';
import LinkAnalyzer from './pages/LinkAnalyzer';
import SymptomTracker from './pages/SymptomTracker';
import History from './pages/History';
import Pricing from './pages/Pricing';
import Settings from './pages/Settings';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import AboutUs from './pages/AboutUs';
import AuthPage from './pages/AuthPage';
import UsernameSetup from './components/UsernameSetup';

// Auth Context
interface User {
  id: string;
  email: string;
  username?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => void;
  logout: () => void;
  setUsername: (username: string) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/70">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUsernameSetup, setShowUsernameSetup] = useState(false);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('medyara_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      if (!parsedUser.username) {
        setShowUsernameSetup(true);
      }
    }
    setLoading(false);

    // Listen for Google OAuth callback
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'google-auth-success') {
        const newUser = {
          id: event.data.user?.id || crypto.randomUUID(),
          email: event.data.user?.email || event.data.email,
          username: event.data.user?.username
        };
        setUser(newUser);
        localStorage.setItem('medyara_user', JSON.stringify(newUser));
        if (!newUser.username) {
          setShowUsernameSetup(true);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate login - in production, call Supabase
    if (!email || !password) throw new Error('Email and password required');
    
    // Demo: accept any valid email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) throw new Error('Invalid email format');
    if (password.length < 6) throw new Error('Password must be at least 6 characters');

    const savedUsers = JSON.parse(localStorage.getItem('medyara_users') || '{}');
    const existingUser = savedUsers[email];
    
    if (existingUser) {
      if (existingUser.password !== password) {
        throw new Error('Invalid password');
      }
      setUser({ id: existingUser.id, email, username: existingUser.username });
      localStorage.setItem('medyara_user', JSON.stringify({ id: existingUser.id, email, username: existingUser.username }));
      if (!existingUser.username) setShowUsernameSetup(true);
    } else {
      throw new Error('User not found. Please sign up first.');
    }
  };

  const signup = async (email: string, password: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) throw new Error('Invalid email format');
    if (password.length < 6) throw new Error('Password must be at least 6 characters');

    const savedUsers = JSON.parse(localStorage.getItem('medyara_users') || '{}');
    if (savedUsers[email]) {
      throw new Error('Email already registered. Please sign in.');
    }

    const newUser = { id: crypto.randomUUID(), email, password, username: null };
    savedUsers[email] = newUser;
    localStorage.setItem('medyara_users', JSON.stringify(savedUsers));
    
    setUser({ id: newUser.id, email });
    localStorage.setItem('medyara_user', JSON.stringify({ id: newUser.id, email }));
    setShowUsernameSetup(true);
  };

  const loginWithGoogle = () => {
    // Simulate Google login for demo
    const mockGoogleUser = {
      id: crypto.randomUUID(),
      email: 'user@gmail.com',
    };
    setUser(mockGoogleUser);
    localStorage.setItem('medyara_user', JSON.stringify(mockGoogleUser));
    setShowUsernameSetup(true);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('medyara_user');
  };

  const setUsername = (username: string) => {
    if (user) {
      const updatedUser = { ...user, username };
      setUser(updatedUser);
      localStorage.setItem('medyara_user', JSON.stringify(updatedUser));
      
      // Update in users database
      const savedUsers = JSON.parse(localStorage.getItem('medyara_users') || '{}');
      if (savedUsers[user.email]) {
        savedUsers[user.email].username = username;
        localStorage.setItem('medyara_users', JSON.stringify(savedUsers));
      }
      
      setShowUsernameSetup(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, logout, setUsername }}>
      <Router>
        {showUsernameSetup && user && !user.username && (
          <UsernameSetup onComplete={setUsername} />
        )}
        <Routes>
          <Route path="/auth" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="symptom-checker" element={<SymptomChecker />} />
            <Route path="study-mode" element={<StudyMode />} />
            <Route path="mcq-generator" element={<MCQGenerator />} />
            <Route path="mcq-solver" element={<MCQSolver />} />
            <Route path="report-explainer" element={<ReportExplainer />} />
            <Route path="image-analyzer" element={<ImageAnalyzer />} />
            <Route path="visual-learning" element={<VisualLearning />} />
            <Route path="explain-like-5" element={<ExplainLike5 />} />
            <Route path="link-analyzer" element={<LinkAnalyzer />} />
            <Route path="symptom-tracker" element={<SymptomTracker />} />
            <Route path="emergency-guide" element={<EmergencyGuide />} />
            <Route path="history" element={<History />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="settings" element={<Settings />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="terms-conditions" element={<TermsConditions />} />
            <Route path="about-us" element={<AboutUs />} />
          </Route>
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
