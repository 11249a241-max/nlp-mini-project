import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Sparkles, Search } from 'lucide-react';

export default function Header({ title, subtitle }) {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* System NLP Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5 text-brand-600 animate-pulse" />
          <span>NLP Engine Active</span>
        </div>

        {/* User Identity Chip */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="text-right hidden md:block">
            <p className="text-xs font-bold text-slate-800 leading-none">{user?.full_name}</p>
            <p className="text-[11px] text-slate-500 mt-1 capitalize">{user?.role?.toLowerCase()} Mode</p>
          </div>
          <img
            src={user?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.full_name || 'User'}`}
            alt={user?.full_name}
            className="w-9 h-9 rounded-full ring-2 ring-brand-500/30 bg-slate-100"
          />
        </div>
      </div>
    </header>
  );
}
