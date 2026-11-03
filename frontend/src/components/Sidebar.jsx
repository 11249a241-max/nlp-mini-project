import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Bot, 
  GitCompare, 
  MessageSquareWarning, 
  BellRing, 
  Users, 
  Sparkles, 
  User, 
  Settings, 
  LogOut,
  GraduationCap,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout, isFaculty } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      name: 'Overview',
      path: isFaculty ? '/faculty/dashboard' : '/student/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Academic Assistant',
      path: '/assistant',
      icon: Bot,
      badge: 'RAG'
    },
    {
      name: 'Project Similarity',
      path: '/projects',
      icon: GitCompare,
      badge: 'Core'
    },
    {
      name: 'Feedback & Complaints',
      path: '/complaints',
      icon: MessageSquareWarning,
    },
    {
      name: 'Notice Intelligence',
      path: '/notices',
      icon: BellRing,
    },
    {
      name: 'Knowledge Sharing',
      path: '/discussions',
      icon: Users,
    },
    {
      name: 'Research Discovery',
      path: '/research',
      icon: Sparkles,
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: User,
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen border-r border-slate-800 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 flex items-center gap-3 border-b border-slate-800">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 via-purpleAccent-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
          <GraduationCap className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-bold text-white text-lg tracking-tight">CampusMind AI</h1>
          <p className="text-xs text-brand-400 font-medium">Smart University SaaS</p>
        </div>
      </div>

      {/* Role Indicator Banner */}
      <div className="mx-4 mt-4 px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs">
        <span className="text-slate-400 font-medium">Active Mode</span>
        <span className={`px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
          isFaculty 
            ? 'bg-purpleAccent-500/20 text-purpleAccent-300 border border-purpleAccent-500/30' 
            : 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
        }`}>
          <ShieldCheck className="h-3 w-3" />
          {user?.role || 'STUDENT'}
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600 to-purpleAccent-600 text-white shadow-md shadow-brand-600/20 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-slate-800 text-slate-300 group-hover:bg-slate-700">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3 mb-3">
          <img
            src={user?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.full_name || 'User'}`}
            alt={user?.full_name}
            className="w-9 h-9 rounded-full ring-2 ring-brand-500/40 bg-slate-800"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.full_name}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.identifier || user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-colors border border-rose-500/20"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
