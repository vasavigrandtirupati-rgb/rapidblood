
import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Heart, MapPin, Search, Users, Shield, Bell, LogIn, Menu, X, 
  Activity, LayoutDashboard, Database, History, User as UserIcon, LogOut,
  ChevronRight, AlertCircle, Droplets, CheckCircle2, TrendingUp, Settings,
  Plus, Minus, Phone, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { UserRole, User, BloodGroup, BloodBank, Donor, BloodRequest } from './types';
import { DUMMY_BLOOD_BANKS, LOCATIONS, BLOOD_GROUPS, DUMMY_DONORS, DUMMY_REQUESTS } from './constants';

// --- Auth Context ---
interface AuthContextType {
  user: User | null;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('rb_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email: string, role: UserRole) => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
      email,
      role,
      location: LOCATIONS[0],
      bloodGroup: 'O+'
    };
    setUser(newUser);
    localStorage.setItem('rb_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rb_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

// --- Route Protection ---
// Added React.FC and made children optional to fix TS errors regarding missing children in JSX nesting.
const ProtectedRoute: React.FC<{ children?: React.ReactNode, roles?: UserRole[] }> = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

// --- Shared UI Components ---
// Added React.FC and made children optional to correctly support React internal props like key and nested JSX children.
const Card: React.FC<{ children?: React.ReactNode, title?: string, icon?: any }> = ({ children, title, icon: Icon }) => (
  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    {title && (
      <div className="flex items-center gap-3 mb-6">
        {Icon && <div className="p-2 bg-red-50 text-red-600 rounded-lg"><Icon size={20} /></div>}
        <h3 className="font-bold text-gray-900">{title}</h3>
      </div>
    )}
    {children}
  </div>
);

// --- Navigation ---
const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Blood Banks', path: '/blood-banks' },
  ];

  if (user) {
    navLinks.push({ name: 'Dashboard', path: '/dashboard' });
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-red-600 fill-red-600" />
            <span className="text-xl font-bold text-gray-900 tracking-tight">RapidBlood</span>
          </Link>
          
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path} 
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.path ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 leading-none">{user.name}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">{user.role}</p>
                </div>
                <button 
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="bg-red-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-red-700 transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                Login
              </Link>
            )}
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-md"
                >
                  {link.name}
                </Link>
              ))}
              {!user && (
                <Link 
                  to="/login" 
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 text-base font-medium text-white bg-red-600 rounded-md text-center mt-4"
                >
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// --- Dashboards ---

const AdminDashboard = () => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Banks', value: '250', icon: Database, color: 'text-blue-600' },
          { label: 'Active Donors', value: '12,402', icon: Users, color: 'text-emerald-600' },
          { label: 'Pending Requests', value: '45', icon: Activity, color: 'text-amber-600' },
          { label: 'Monthly Growth', value: '+12%', icon: TrendingUp, color: 'text-red-600' },
        ].map((stat, i) => (
          <Card key={i}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-gray-50 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="System Logs" icon={Activity}>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-sm text-gray-600">New blood bank verified: Guntur Red Cross</span>
                </div>
                <span className="text-xs text-gray-400">2 mins ago</span>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Global Alerts" icon={Bell}>
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
            <h4 className="text-red-800 font-bold text-sm mb-1 flex items-center gap-2">
              <AlertCircle size={16} /> Critical Shortage Alert
            </h4>
            <p className="text-red-600 text-xs">O- Negative units are critically low in the Visakhapatnam region.</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

const BloodBankDashboard = () => {
  const [inventory, setInventory] = useState(D_INVENTORY);
  const updateStock = (group: BloodGroup, delta: number) => {
    setInventory(prev => ({ ...prev, [group]: Math.max(0, prev[group] + delta) }));
  };

  return (
    <div className="space-y-8">
      <Card title="Real-time Inventory Management" icon={Droplets}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {BLOOD_GROUPS.map(bg => (
            <div key={bg} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center">
              <span className="text-lg font-bold text-gray-900 mb-1">{bg}</span>
              <span className="text-2xl font-black text-red-600 mb-4">{inventory[bg]}</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => updateStock(bg, -1)}
                  className="p-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Minus size={14} />
                </button>
                <button 
                  onClick={() => updateStock(bg, 1)}
                  className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Nearby Active Donors" icon={Users}>
          <div className="space-y-4">
            {D_DONORS.slice(0, 4).map(donor => (
              <div key={donor.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center font-bold text-red-600">
                    {donor.bloodGroup}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{donor.name}</p>
                    <p className="text-xs text-gray-500">{donor.location}</p>
                  </div>
                </div>
                <button className="text-xs font-bold text-red-600 hover:underline">Notify</button>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Pending Requests" icon={Clock}>
           <div className="space-y-4">
             {D_REQUESTS.slice(0, 3).map(req => (
               <div key={req.id} className="p-3 border border-gray-100 rounded-xl">
                 <div className="flex justify-between items-start mb-2">
                    <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded uppercase">
                      {req.urgency}
                    </span>
                    <span className="text-[10px] text-gray-400">12:30 PM</span>
                 </div>
                 <p className="text-sm font-bold text-gray-900">{req.units} units of {req.bloodGroup}</p>
                 <p className="text-xs text-gray-500">{req.hospital}</p>
               </div>
             ))}
           </div>
        </Card>
      </div>
    </div>
  );
};

const SeekerDashboard = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Find Resources</h2>
        <div className="flex gap-2 w-full md:w-auto">
          <Link to="/blood-banks" className="flex-1 md:flex-none px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm text-center shadow-lg shadow-red-100">
            Emergency Search
          </Link>
          <button className="flex-1 md:flex-none px-6 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-sm">
            Create Request
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card title="My Active Requests" icon={Activity}>
            {D_REQUESTS.slice(0, 2).map(req => (
              <div key={req.id} className="mb-4 last:mb-0 p-4 border border-gray-100 rounded-2xl">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center font-bold">{req.bloodGroup}</div>
                    <span className="font-bold text-gray-900">{req.units} Units</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${req.status === 'fulfilled' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {req.status}
                  </span>
                </div>
                <div className="flex items-center text-xs text-gray-500 gap-4">
                  <span className="flex items-center gap-1"><MapPin size={12} /> {req.hospital}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {new Date(req.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </Card>
        </div>
        <Card title="Nearby Availability" icon={MapPin}>
           <div className="space-y-4">
              {D_BANKS.slice(0, 3).map(bank => (
                <div key={bank.id} className="text-sm">
                   <p className="font-bold text-gray-900">{bank.name}</p>
                   <p className="text-xs text-gray-500 mb-2">{bank.location}</p>
                   <div className="flex gap-1 overflow-x-auto pb-1">
                      {Object.entries(bank.inventory).slice(0, 4).map(([bg, stock]) => (
                        <span key={bg} className="px-2 py-0.5 bg-gray-50 border border-gray-100 rounded text-[10px] whitespace-nowrap">
                          {bg}: <strong>{stock as number}</strong>
                        </span>
                      ))}
                   </div>
                </div>
              ))}
           </div>
        </Card>
      </div>
    </div>
  );
};

const DonorDashboard = () => {
  const [available, setAvailable] = useState(true);
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4">
              <Droplets size={32} />
            </div>
            <h3 className="text-3xl font-black text-gray-900">O+</h3>
            <p className="text-gray-500 text-sm">Your Blood Group</p>
          </div>
        </Card>
        <Card>
           <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4">
              <Heart size={32} />
            </div>
            <h3 className="text-3xl font-black text-gray-900">12</h3>
            <p className="text-gray-500 text-sm">Total Donations</p>
          </div>
        </Card>
        <Card>
          <div className="flex flex-col items-center text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${available ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
              <CheckCircle2 size={32} />
            </div>
            <button 
              onClick={() => setAvailable(!available)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${available ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'}`}
            >
              {available ? 'ACTIVE' : 'INACTIVE'}
            </button>
            <p className="text-gray-500 text-sm mt-2">Availability Status</p>
          </div>
        </Card>
      </div>

      <Card title="Donation History" icon={History}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-gray-400 font-bold border-b border-gray-50">
              <tr>
                <th className="pb-4">Location</th>
                <th className="pb-4">Date</th>
                <th className="pb-4">Units</th>
                <th className="pb-4">Status</th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              {[
                { loc: 'Tirupati Hospital', date: 'Oct 12, 2023', units: 1 },
                { loc: 'Red Cross Guntur', date: 'June 05, 2023', units: 1 },
              ].map((h, i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0">
                  <td className="py-4 font-semibold text-gray-900">{h.loc}</td>
                  <td className="py-4">{h.date}</td>
                  <td className="py-4">{h.units} unit</td>
                  <td className="py-4"><span className="text-emerald-500 font-bold">Successful</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  if (!user) return null;

  const renderContent = () => {
    switch(user.role) {
      case UserRole.ADMIN: return <AdminDashboard />;
      case UserRole.BLOOD_BANK: return <BloodBankDashboard />;
      case UserRole.SEEKER: return <SeekerDashboard />;
      case UserRole.DONOR: return <DonorDashboard />;
      default: return null;
    }
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <header className="mb-10">
          <p className="text-red-600 font-bold text-xs uppercase tracking-widest mb-1">Command Center</p>
          <h1 className="text-4xl font-black text-gray-900">Welcome, {user.name}</h1>
        </header>
        {renderContent()}
      </div>
    </div>
  );
};

// --- Pages ---

const HomePage = () => {
  return (
    <div className="pt-16 gradient-bg">
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:w-1/2 text-center lg:text-left z-10"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider mb-6">
              Critical Emergency Support
            </span>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 leading-tight mb-6">
              Every Drop <span className="text-red-600">Saves</span> A Life.
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto lg:mx-0">
              RapidBlood connects life-seekers with blood banks and voluntary donors in real-time. 
              Efficiency in emergencies when seconds count.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/blood-banks" className="px-8 py-4 bg-red-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-red-200 hover:bg-red-700 transition-all flex items-center justify-center gap-2">
                Find Blood Now <ChevronRight className="h-5 w-5" />
              </Link>
              <Link to="/login" className="px-8 py-4 bg-white text-gray-900 border-2 border-gray-100 rounded-xl font-bold text-lg hover:border-red-200 transition-all flex items-center justify-center gap-2">
                Become a Donor
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="lg:w-1/2 mt-16 lg:mt-0 flex justify-center relative"
          >
            <div className="relative w-72 h-72 lg:w-96 lg:h-96 bg-red-50 rounded-full animate-pulse blur-3xl opacity-50 absolute -z-10"></div>
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="blood-drop"
            >
              <Droplets className="w-48 h-48 lg:w-64 lg:h-64 text-red-600 fill-red-500/20" strokeWidth={0.5} />
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Platform Features</h2>
            <div className="w-20 h-1 bg-red-600 mx-auto mt-4 rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Database, title: "Live Inventory", desc: "Real-time tracking of blood units across verified network banks." },
              { icon: Bell, title: "Emergency Alerts", desc: "Instant push notifications for critical shortages in your area." },
              { icon: Users, title: "Donor Network", desc: "Verified database of volunteers ready to help during crises." }
            ].map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-xl transition-all"
              >
                <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center text-red-600 mb-6">
                  <f.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-4">{f.title}</h3>
                <p className="text-gray-600 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-6 md:mb-0">
             <Heart className="h-6 w-6 text-red-600 fill-red-600" />
             <span className="text-xl font-bold text-white tracking-tight">RapidBlood</span>
          </div>
          <p>© 2024 RapidBlood. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const BloodBanksPage = () => {
  const [filterLocation, setFilterLocation] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  
  const filteredBanks = D_BANKS.filter(bank => {
    const matchesLocation = filterLocation ? bank.location === filterLocation : true;
    const matchesGroup = filterGroup ? bank.inventory[filterGroup as BloodGroup] > 0 : true;
    return matchesLocation && matchesGroup;
  });

  return (
    <div className="pt-24 pb-20 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Blood Banks</h1>
            <p className="text-gray-500">Find real-time availability in your vicinity.</p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Location</label>
              <select 
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="bg-white border-gray-200 border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none min-w-[160px]"
              >
                <option value="">All Locations</option>
                {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Blood Group</label>
              <select 
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value)}
                className="bg-white border-gray-200 border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none min-w-[120px]"
              >
                <option value="">Any Group</option>
                {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredBanks.map((bank) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={bank.id}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
                      <Database className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{bank.name}</h3>
                      <div className="flex items-center text-gray-500 text-xs mt-1">
                        <MapPin className="w-3 h-3 mr-1" /> {bank.location}
                      </div>
                    </div>
                  </div>
                  {bank.verified && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                </div>

                <div className="grid grid-cols-4 gap-2 mb-6">
                  {BLOOD_GROUPS.map(bg => (
                    <div key={bg} className={`text-center py-2 rounded-lg ${bank.inventory[bg] > 10 ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-400'}`}>
                      <div className="text-[10px] font-bold opacity-70">{bg}</div>
                      <div className="text-sm font-black">{bank.inventory[bg]}</div>
                    </div>
                  ))}
                </div>

                <button className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">
                  Contact Bank
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const LoginPage = () => {
  const { login } = useAuth();
  const [role, setRole] = useState<UserRole>(UserRole.SEEKER);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email || 'demo@rapidblood.com', role);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg p-4 pt-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Heart className="h-12 w-12 text-red-600 fill-red-600 mx-auto mb-4" />
          <h2 className="text-3xl font-black text-gray-900">Welcome Back</h2>
          <p className="text-gray-500 text-sm">Sign in to your RapidBlood account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border-gray-200 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 outline-none"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">I am a</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Seeker', value: UserRole.SEEKER },
                { label: 'Donor', value: UserRole.DONOR },
                { label: 'Blood Bank', value: UserRole.BLOOD_BANK },
                { label: 'Admin', value: UserRole.ADMIN },
              ].map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                    role === r.value 
                      ? 'bg-red-600 text-white border-red-600' 
                      : 'bg-white text-gray-600 border-gray-200 hover:border-red-200'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-red-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-red-200 hover:bg-red-700 transition-all active:scale-95"
          >
            Sign In
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// --- App Root ---
const D_INVENTORY: Record<BloodGroup, number> = {
  'A+': 12, 'A-': 4, 'B+': 18, 'B-': 2, 'AB+': 8, 'AB-': 1, 'O+': 25, 'O-': 5
};
const D_BANKS = DUMMY_BLOOD_BANKS;
const D_DONORS = DUMMY_DONORS;
const D_REQUESTS = DUMMY_REQUESTS;

const App = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/blood-banks" element={<BloodBanksPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
};

export default App;
