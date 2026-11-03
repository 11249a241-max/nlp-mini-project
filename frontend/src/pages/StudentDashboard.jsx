import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { dashboardAPI } from '../services/api';
import { 
  GitCompare, 
  MessageSquareWarning, 
  BellRing, 
  Users, 
  Bot, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  FileText
} from 'lucide-react';

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await dashboardAPI.getStudentData();
        setData(res.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex-1 pb-12">
      <Header 
        title="Student Intelligence Hub" 
        subtitle="Manage academic originality, grievance tracking, and AI document assistance" 
      />

      <div className="max-w-7xl mx-auto px-8 pt-8 space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-700 via-purpleAccent-700 to-indigo-800 text-white p-8 shadow-lg shadow-brand-700/15">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-3">
              CampusMind AI Core
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {data?.user_name || 'Student'}!
            </h1>
            <p className="mt-2 text-brand-100 text-sm leading-relaxed">
              Verify your final-year project originality against university archives, query official circular deadlines, or engage in academic peer discussions.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/projects"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-brand-800 text-xs font-bold shadow-sm hover:bg-brand-50 transition-colors"
              >
                <GitCompare className="h-4 w-4 text-brand-600" />
                <span>Check Project Originality</span>
              </Link>
              <Link
                to="/assistant"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purpleAccent-500/30 text-white border border-purpleAccent-300/40 text-xs font-bold hover:bg-purpleAccent-500/50 transition-colors"
              >
                <Bot className="h-4 w-4" />
                <span>Ask AI Assistant</span>
              </Link>
            </div>
          </div>
          {/* Decorative background circle */}
          <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-white/5 pointer-events-none" />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Projects */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Submitted Projects</span>
              <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600">
                <GitCompare className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{data?.total_projects ?? 0}</div>
            <p className="mt-1 text-xs text-slate-500">
              {data?.latest_similarity ? `Latest: ${data.latest_similarity.overall_similarity}% similarity` : 'No submissions yet'}
            </p>
          </div>

          {/* Latest Similarity Indicator */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Latest Similarity</span>
              <div className="p-2.5 rounded-xl bg-purpleAccent-50 text-purpleAccent-600">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-extrabold text-slate-900">
                {data?.latest_similarity?.overall_similarity ?? 0}%
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                (data?.latest_similarity?.overall_similarity ?? 0) > 60 
                  ? 'bg-rose-100 text-rose-700' 
                  : 'bg-emerald-100 text-emerald-700'
              }`}>
                {(data?.latest_similarity?.overall_similarity ?? 0) > 60 ? 'High Overlap' : 'Clear / Novel'}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 truncate">
              {data?.latest_similarity?.top_match_title || 'Repository clean'}
            </p>
          </div>

          {/* Complaints */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">My Feedback</span>
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
                <MessageSquareWarning className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{data?.total_complaints ?? 0}</div>
            <p className="mt-1 text-xs text-amber-600 font-semibold">
              {data?.pending_complaints ?? 0} in progress / review
            </p>
          </div>

          {/* Discussions */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Discussions</span>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{data?.active_discussions ?? 0}</div>
            <p className="mt-1 text-xs text-slate-500">Participating threads</p>
          </div>
        </div>

        {/* Content Split: Left Recent Projects, Right Official Circulars */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Project Analysis History */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Project Originality Analysis History</h3>
              <Link to="/projects" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                <span>View All</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {data?.project_history?.length > 0 ? (
              <div className="space-y-3">
                {data.project_history.map((p) => (
                  <div key={p.id} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-brand-300 transition-all">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{p.title}</h4>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(p.created_at).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-slate-700">{p.status}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-slate-400 font-medium">Similarity</p>
                        <p className={`text-base font-extrabold ${
                          p.similarity_score > 60 ? 'text-rose-600' : 'text-emerald-600'
                        }`}>
                          {p.similarity_score}%
                        </p>
                      </div>

                      <Link
                        to={`/projects`}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 text-xs font-bold transition-colors"
                      >
                        Report
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-white border border-dashed border-slate-300 text-center">
                <FileText className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                <h4 className="font-bold text-slate-700 text-sm">No Projects Submitted Yet</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Submit your capstone or lab project abstract to test textual and semantic originality against department archives.
                </p>
                <Link
                  to="/projects"
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700"
                >
                  Submit First Project
                </Link>
              </div>
            )}
          </div>

          {/* Right: Recent Notices */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Latest Circulars</h3>
              <Link to="/notices" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                <span>All Notices</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {data?.recent_notices?.map((n) => (
                <div key={n.id} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      {n.category}
                    </span>
                    <span className="text-slate-400">
                      {new Date(n.publication_date).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs leading-snug">{n.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2">{n.summary}</p>

                  {n.important_deadlines?.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-rose-600">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Deadline: {n.important_deadlines[0].date}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
