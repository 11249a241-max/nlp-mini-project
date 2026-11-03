import React from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { User, ShieldCheck, Mail, Building, Hash, Calendar, Award } from 'lucide-react';

export default function Profile() {
  const { user, isFaculty } = useAuth();

  return (
    <div className="flex-1 pb-16">
      <Header 
        title="User Profile & Academic Credentials" 
        subtitle="Manage your institutional identity and role credentials" 
      />

      <div className="max-w-4xl mx-auto px-8 pt-8 space-y-8">
        <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-slate-100 pb-6">
            <img
              src={user?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.full_name || 'User'}`}
              alt={user?.full_name}
              className="w-24 h-24 rounded-2xl ring-4 ring-brand-500/20 shadow-md bg-slate-100"
            />
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <h3 className="text-2xl font-black text-slate-900">{user?.full_name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  isFaculty 
                    ? 'bg-purpleAccent-100 text-purpleAccent-700 border border-purpleAccent-300'
                    : 'bg-brand-100 text-brand-700 border border-brand-300'
                }`}>
                  {user?.role}
                </span>
              </div>
              <p className="text-sm text-slate-500">{user?.email}</p>
              <p className="text-xs text-brand-600 font-bold uppercase tracking-wider mt-2">
                Verified University Identity
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5" />
                {isFaculty ? 'Faculty ID Code' : 'Roll Number / Student ID'}
              </span>
              <p className="font-extrabold text-slate-800 text-base">{user?.identifier || 'N/A'}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5" />
                Department
              </span>
              <p className="font-extrabold text-slate-800 text-base">{user?.department_name || 'Computer Science and Engineering'}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                System Role Access
              </span>
              <p className="font-extrabold text-slate-800 text-base">{isFaculty ? 'Faculty Reviewer & Publisher' : 'Student Submitter & Researcher'}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Member Since
              </span>
              <p className="font-extrabold text-slate-800 text-base">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active Term 2026'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
