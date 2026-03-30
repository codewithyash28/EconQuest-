import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  ShoppingBag, 
  Trophy, 
  LogOut, 
  Zap, 
  Coins, 
  Menu, 
  X,
  Users,
  BarChart,
  ShieldCheck,
  HelpCircle,
  Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import NotificationCenter from './NotificationCenter';

export default function Navbar({ user, onLogout }: { user: UserProfile, onLogout: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/quests', icon: BookOpen, label: 'Quests' },
    { path: '/review', icon: Brain, label: 'Review' },
    { path: '/leaderboard', icon: BarChart, label: 'Leaderboard' },
    { path: '/groups', icon: Users, label: 'Squads' },
    { path: '/shop', icon: ShoppingBag, label: 'Shop' },
    { path: '/achievements', icon: Trophy, label: 'Achievements' },
    { path: '/about', icon: HelpCircle, label: 'Why it works' },
  ];

  if (user.role === 'admin') {
    navItems.push({ path: '/admin', icon: ShieldCheck, label: 'Admin' });
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center space-x-3 group">
          <Zap className="w-8 h-8 text-yellow-400 group-hover:scale-110 transition-transform" />
          <span className="text-2xl font-black tracking-tighter uppercase italic">
            Econ<span className="text-yellow-400">Quest</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              data-tour={item.label.toLowerCase()}
              className={`flex items-center space-x-2 text-sm font-bold uppercase tracking-widest transition-colors hover:text-yellow-400 ${
                location.pathname === item.path ? 'text-yellow-400' : 'text-gray-400'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center space-x-6">
          <NotificationCenter userId={user.uid} />
          
          <div className="flex items-center space-x-4 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <div className="flex items-center space-x-1 text-yellow-400">
              <Zap className="w-4 h-4" />
              <span className="font-black">{user.xp} XP</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center space-x-1 text-blue-400">
              <Coins className="w-4 h-4" />
              <span className="font-black">{user.coins}</span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center space-x-4 md:hidden">
          <NotificationCenter userId={user.uid} />
          <button
            className="p-2 text-gray-400"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0a0a0a] border-b border-white/10 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-4 p-4 rounded-2xl text-lg font-bold uppercase tracking-widest ${
                    location.pathname === item.path ? 'bg-yellow-400 text-black' : 'bg-white/5 text-gray-400'
                  }`}
                >
                  <item.icon className="w-6 h-6" />
                  <span>{item.label}</span>
                </Link>
              ))}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1 text-yellow-400">
                    <Zap className="w-5 h-5" />
                    <span className="font-black">{user.xp} XP</span>
                  </div>
                  <div className="flex items-center space-x-1 text-blue-400">
                    <Coins className="w-5 h-5" />
                    <span className="font-black">{user.coins}</span>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-red-400"
                >
                  <LogOut className="w-6 h-6" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
