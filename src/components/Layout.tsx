import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Activity, BookOpen, HelpCircle, AlertTriangle, History as HistoryIcon, Stethoscope, FileSearch, Image as ImageIcon, Baby, CreditCard, ScanFace, FileQuestion, Link as LinkIcon, LineChart, Settings, ShieldCheck, FileText, Users, LogOut, User, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '../App';

export default function Layout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900/50 backdrop-blur-xl border-r border-white/5 flex-col hidden lg:flex fixed h-full z-20">
        {/* Logo */}
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="bg-gradient-to-br from-blue-500 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-purple-500/20"
          >
            <Stethoscope className="w-6 h-6 text-white" />
          </motion.div>
          <span className="font-bold text-2xl bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Medyara AI</span>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3 px-3">Menu</div>
          <NavItem to="/" icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" />
          
          <div className="text-xs font-semibold text-white/30 uppercase tracking-wider mt-8 mb-3 px-3">Clinical Tools</div>
          <NavItem to="/symptom-checker" icon={<Activity className="w-5 h-5" />} label="Symptom Checker" />
          <NavItem to="/symptom-tracker" icon={<LineChart className="w-5 h-5" />} label="Symptom Tracker" />
          <NavItem to="/image-analyzer" icon={<ScanFace className="w-5 h-5" />} label="Image Analyzer" />
          <NavItem to="/report-explainer" icon={<FileSearch className="w-5 h-5" />} label="Report Explainer" />
          
          <div className="text-xs font-semibold text-white/30 uppercase tracking-wider mt-8 mb-3 px-3">Study Tools</div>
          <NavItem to="/study-mode" icon={<BookOpen className="w-5 h-5" />} label="Study Mode" />
          <NavItem to="/mcq-generator" icon={<HelpCircle className="w-5 h-5" />} label="MCQ Generator" />
          <NavItem to="/mcq-solver" icon={<FileQuestion className="w-5 h-5" />} label="MCQ Solver" />
          <NavItem to="/visual-learning" icon={<ImageIcon className="w-5 h-5" />} label="Visual Learning" />
          <NavItem to="/explain-like-5" icon={<Baby className="w-5 h-5" />} label="Explain Like I'm 5" />
          <NavItem to="/link-analyzer" icon={<LinkIcon className="w-5 h-5" />} label="Link Analyzer" />
          
          <div className="text-xs font-semibold text-white/30 uppercase tracking-wider mt-8 mb-3 px-3">Resources</div>
          <NavItem to="/emergency-guide" icon={<AlertTriangle className="w-5 h-5" />} label="Emergency Guide" />
          <NavItem to="/history" icon={<HistoryIcon className="w-5 h-5" />} label="History" />
          <NavItem to="/pricing" icon={<CreditCard className="w-5 h-5" />} label="Pricing" />
          <NavItem to="/settings" icon={<Settings className="w-5 h-5" />} label="Settings" />

          <div className="text-xs font-semibold text-white/30 uppercase tracking-wider mt-8 mb-3 px-3">Legal</div>
          <NavItem to="/about-us" icon={<Users className="w-5 h-5" />} label="About Us" />
          <NavItem to="/privacy-policy" icon={<ShieldCheck className="w-5 h-5" />} label="Privacy" />
          <NavItem to="/terms-conditions" icon={<FileText className="w-5 h-5" />} label="Terms" />
        </nav>
        
        {/* User Profile */}
        <div className="p-4 border-t border-white/5">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                {user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-white truncate">
                  {user?.username || 'User'}
                </p>
                <p className="text-xs text-white/40 truncate">{user?.email}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-full left-0 right-0 mb-2 bg-slate-800 border border-white/10 rounded-xl overflow-hidden shadow-xl"
                >
                  <button
                    onClick={() => { navigate('/settings'); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-white/70 hover:bg-white/5 hover:text-white transition-all"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm">Profile Settings</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Sign Out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen lg:ml-72">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-white/5 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-1.5 rounded-lg">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">Medyara AI</span>
          </div>
          <button onClick={handleLogout} className="text-white/60 hover:text-white p-2">
            <LogOut className="w-5 h-5" />
          </button>
        </header>
        
        {/* Mobile Nav */}
        <nav className="lg:hidden flex gap-2 overflow-x-auto p-3 bg-slate-900/50 border-b border-white/5 sticky top-[57px] z-10">
          <MobileNavItem to="/" label="Home" />
          <MobileNavItem to="/symptom-checker" label="Symptoms" />
          <MobileNavItem to="/image-analyzer" label="Images" />
          <MobileNavItem to="/study-mode" label="Study" />
          <MobileNavItem to="/emergency-guide" label="Emergency" />
          <MobileNavItem to="/pricing" label="Pro" />
        </nav>
        
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
          isActive 
            ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-white/10' 
            : 'text-white/50 hover:bg-white/5 hover:text-white'
        }`
      }
    >
      <span className="group-hover:scale-110 transition-transform">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </NavLink>
  );
}

function MobileNavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
          isActive 
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
            : 'bg-white/5 text-white/60 hover:bg-white/10'
        }`
      }
    >
      {label}
    </NavLink>
  );
}
