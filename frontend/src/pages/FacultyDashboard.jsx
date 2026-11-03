import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { dashboardAPI, projectAPI } from '../services/api';
import { 
  GitCompare, 
  MessageSquareWarning, 
  BellRing, 
  Users, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';

const SENTIMENT_COLORS = {
  Positive: '#10b981',
  Neutral: '#64748b',
  Negative: '#f43f5e'
};

export default function FacultyDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFacultyData();
  }, []);

  const fetchFacultyData = async () => {
    try {
      const res = await dashboardAPI.getFacultyData();
      setData(res.data);
    } catch (err) {
      console.error("Faculty dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 pb-12">
      <Header 
        title="Faculty Academic Command Center" 
        subtitle="Departmental NLP analytics, student project originality auditing, and grievance resolution" 
      />

      <div className="max-w-7xl mx-auto px-8 pt-8 space-y-8">
        {/* Top Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Projects</span>
              <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600">
                <GitCompare className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{data?.total_projects ?? 0}</div>
            <p className="mt-1 text-xs text-amber-600 font-bold">
              {data?.awaiting_review ?? 0} awaiting faculty review
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Student Grievances</span>
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
                <MessageSquareWarning className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{data?.total_complaints ?? 0}</div>
            <p className="mt-1 text-xs text-rose-600 font-bold">
              {data?.pending_complaints ?? 0} unresolved complaints
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Circulars</span>
              <div className="p-2.5 rounded-xl bg-purpleAccent-50 text-purpleAccent-600">
                <BellRing className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{data?.total_notices ?? 0}</div>
            <p className="mt-1 text-xs text-slate-500">Indexed in Notice RAG</p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Academic Forum</span>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{data?.total_discussions ?? 0}</div>
            <p className="mt-1 text-xs text-slate-500">Student queries active</p>
          </div>
        </div>

        {/* Dynamic Analytics Charts (Recharts) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sentiment Distribution */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Student Grievance Sentiment</h3>
                <p className="text-xs text-slate-500">Extracted by CampusMind NLP Aspect Engine</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                Real-Time DB
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.sentiment_distribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(data?.sentiment_distribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[entry.name] || '#6382f2'} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Complaints by Domain Category</h3>
                <p className="text-xs text-slate-500">Categorized via linguistic rule-scoring</p>
              </div>
              <Link to="/complaints" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                <span>View Full Matrix</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.category_distribution || []}>
                  <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4361eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Project Similarity Trends & Student Review Table */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Recent Student Project Submissions</h3>
              <p className="text-xs text-slate-500">Originality metrics computed via Sentence-BERT + TF-IDF</p>
            </div>
            <Link
              to="/projects"
              className="px-4 py-2 rounded-xl bg-brand-50 text-brand-700 hover:bg-brand-100 text-xs font-bold transition-colors"
            >
              Open Similarity Review Portal
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Project Title</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Similarity Score</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.recent_projects?.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-900">{p.title}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">{p.student_name}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        p.overall_similarity > 60
                          ? 'bg-rose-100 text-rose-700'
                          : p.overall_similarity > 35
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {p.overall_similarity}% Overall
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-semibold text-slate-700">{p.faculty_status}</td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        to="/projects"
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-brand-600 hover:bg-brand-50 transition-colors"
                      >
                        Audit Report
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
